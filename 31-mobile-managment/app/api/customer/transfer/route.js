import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Canonical collection name used across all transfer routes
const TRANSFERS_COL = 'ownership_transfers';

// GET — list pending incoming transfers for customer
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    if (!customerId || !ObjectId.isValid(customerId))
      return NextResponse.json({ error: 'Valid customerId required' }, { status: 400 });

    const transfers = await getCollection(TRANSFERS_COL);
    const cId = new ObjectId(customerId);

    const all = await transfers.aggregate([
      { $match: { toUserId: cId } },
      { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
      { $lookup: { from: 'users', localField: 'fromUserId', foreignField: '_id', as: 'from' } },
      { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$from', preserveNullAndEmptyArrays: true } },
      { $project: { 'from.password': 0, 'from.passwordHash': 0 } },
      { $sort: { createdAt: -1 } },
    ]).toArray();

    return NextResponse.json({ success: true, transfers: all });
  } catch (error) {
    console.error('Customer transfer GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
  }
}

// PATCH — accept or reject a transfer
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { transferId, customerId, action } = body;

    if (!transferId || !customerId || !action)
      return NextResponse.json({ error: 'transferId, customerId and action are required' }, { status: 400 });
    if (!['accept', 'reject'].includes(action))
      return NextResponse.json({ error: 'action must be accept or reject' }, { status: 400 });

    const transfers = await getCollection(TRANSFERS_COL);
    const devices = await getCollection('devices');
    const warranties = await getCollection('warranties');
    const cId = new ObjectId(customerId);
    const tId = new ObjectId(transferId);

    const transfer = await transfers.findOne({ _id: tId, toUserId: cId, status: 'pending' });
    if (!transfer) return NextResponse.json({ error: 'Transfer not found or already processed' }, { status: 404 });

    if (action === 'accept') {
      // Transfer device ownership — set both ownerId and customerId for full compatibility
      const device = await devices.findOne({ _id: transfer.deviceId });
      await devices.updateOne(
        { _id: transfer.deviceId },
        {
          $set: { ownerId: cId, customerId: cId, status: 'resold', updatedAt: new Date() },
          $push: {
            ownershipHistory: {
              previousOwnerId: transfer.fromUserId,
              newOwnerId: cId,
              transferDate: new Date(),
              salePrice: transfer.salePrice || null,
              via: 'transfer',
            }
          }
        }
      );
      // Hand warranty to new owner
      await warranties.updateOne(
        { deviceId: transfer.deviceId, status: 'active' },
        { $set: { customerId: cId, updatedAt: new Date() } }
      );
      await transfers.updateOne({ _id: tId }, {
        $set: { status: 'completed', completedAt: new Date(), updatedAt: new Date() }
      });
      return NextResponse.json({ success: true, message: 'Transfer accepted. Device is now yours.' });
    } else {
      await transfers.updateOne({ _id: tId }, {
        $set: { status: 'rejected', rejectedAt: new Date(), updatedAt: new Date() }
      });
      return NextResponse.json({ success: true, message: 'Transfer rejected.' });
    }
  } catch (error) {
    console.error('Customer transfer PATCH error:', error);
    return NextResponse.json({ error: 'Failed to process transfer' }, { status: 500 });
  }
}
