import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    if (!customerId) return NextResponse.json({ error: 'customerId required' }, { status: 400 });

    const cId = new ObjectId(customerId);
    const transfersCol = await getCollection('ownership_transfers');

    const transfers = await transfersCol.aggregate([
      { $match: { toUserId: cId } },
      { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
      { $lookup: { from: 'users', localField: 'fromUserId', foreignField: '_id', as: 'fromUser' } },
      { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$fromUser', preserveNullAndEmptyArrays: true } },
      { $project: { 'fromUser.password': 0, 'fromUser.passwordHash': 0 } },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    return NextResponse.json({ success: true, transfers });
  } catch (error) {
    console.error('Customer transfers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { transferId, action, customerId } = body;

    if (!transferId || !action || !customerId)
      return NextResponse.json({ error: 'transferId, action and customerId are required' }, { status: 400 });
    if (!['accept', 'reject'].includes(action))
      return NextResponse.json({ error: 'action must be accept or reject' }, { status: 400 });

    const cId = new ObjectId(customerId);
    const tId = new ObjectId(transferId);

    const transfersCol = await getCollection('ownership_transfers');
    const devicesCol = await getCollection('devices');

    const transfer = await transfersCol.findOne({ _id: tId, toUserId: cId, status: 'pending' });
    if (!transfer) return NextResponse.json({ error: 'Transfer not found or already processed' }, { status: 404 });

    const now = new Date();

    if (action === 'accept') {
      // Update device ownership
      await devicesCol.updateOne(
        { _id: transfer.deviceId },
        {
          $set: { currentOwnerId: cId, updatedAt: now },
          $push: {
            ownershipHistory: {
              ownerId: cId,
              transferDate: now,
              transferPrice: transfer.salePrice || null,
              transferId: tId,
            }
          }
        }
      );
      await transfersCol.updateOne({ _id: tId }, { $set: { status: 'accepted', resolvedAt: now } });
    } else {
      await transfersCol.updateOne({ _id: tId }, { $set: { status: 'rejected', resolvedAt: now } });
    }

    return NextResponse.json({ success: true, message: action === 'accept' ? 'Transfer accepted' : 'Transfer rejected' });
  } catch (error) {
    console.error('Customer transfers PATCH error:', error);
    return NextResponse.json({ error: 'Failed to process transfer' }, { status: 500 });
  }
}
