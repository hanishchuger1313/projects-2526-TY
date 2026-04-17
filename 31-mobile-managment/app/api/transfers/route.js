import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Canonical collection — must match api/customer/transfer/route.js
const TRANSFERS_COL = 'ownership_transfers';

// Used by shop owners / resellers to initiate a transfer TO a customer
export async function POST(request) {
  try {
    const body = await request.json();
    const { deviceId, fromUserId, toUserPhone, toUserEmail, salePrice, notes } = body;

    if (!deviceId || !fromUserId || (!toUserPhone && !toUserEmail))
      return NextResponse.json({ error: 'deviceId, fromUserId and toUserPhone or toUserEmail are required' }, { status: 400 });

    const devicesCol = await getCollection('devices');
    const usersCol = await getCollection('users');
    const transfersCol = await getCollection(TRANSFERS_COL);

    const dId = new ObjectId(deviceId);
    const fId = new ObjectId(fromUserId);

    // Verify sender owns device (check both ownerId and customerId fields)
    const device = await devicesCol.findOne({
      _id: dId,
      $or: [{ ownerId: fId }, { customerId: fId }]
    });
    if (!device) return NextResponse.json({ error: 'Device not found or not owned by sender' }, { status: 404 });

    // Find recipient by phone or email
    const toUser = await usersCol.findOne(
      toUserPhone ? { phone: toUserPhone } : { email: toUserEmail }
    );
    if (!toUser) return NextResponse.json({ error: 'Recipient not found. They must be registered.' }, { status: 404 });
    if (toUser._id.toString() === fromUserId)
      return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 });

    // Check no pending transfer already exists for this device
    const existing = await transfersCol.findOne({ deviceId: dId, status: 'pending' });
    if (existing) return NextResponse.json({ error: 'A pending transfer already exists for this device' }, { status: 409 });

    const doc = {
      deviceId: dId,
      fromUserId: fId,
      toUserId: toUser._id,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      notes: notes || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await transfersCol.insertOne(doc);
    return NextResponse.json({ success: true, transferId: result.insertedId, recipientName: toUser.name });
  } catch (error) {
    console.error('Transfer initiate error:', error);
    return NextResponse.json({ error: 'Failed to initiate transfer' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const uId = new ObjectId(userId);
    const transfersCol = await getCollection(TRANSFERS_COL);

    const transfers = await transfersCol.aggregate([
      { $match: { $or: [{ fromUserId: uId }, { toUserId: uId }] } },
      { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
      { $lookup: { from: 'users', localField: 'fromUserId', foreignField: '_id', as: 'fromUser' } },
      { $lookup: { from: 'users', localField: 'toUserId', foreignField: '_id', as: 'toUser' } },
      { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$fromUser', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$toUser', preserveNullAndEmptyArrays: true } },
      { $project: { 'fromUser.password': 0, 'fromUser.passwordHash': 0, 'toUser.password': 0, 'toUser.passwordHash': 0 } },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    return NextResponse.json({ success: true, transfers });
  } catch (error) {
    console.error('Transfer GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
  }
}
