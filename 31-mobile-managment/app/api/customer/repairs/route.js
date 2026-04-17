import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    if (!customerId || !ObjectId.isValid(customerId))
      return NextResponse.json({ error: 'Valid customerId required' }, { status: 400 });

    const devices = await getCollection('devices');
    const repairs = await getCollection('repairs');
    const cId = new ObjectId(customerId);

    // Support both ownerId and customerId fields
    const allDevices = await devices.find({ $or: [{ ownerId: cId }, { customerId: cId }] }).toArray();
    const deviceIds = allDevices.map(d => d._id);

    // Match repairs by device list OR directly by customerId stored on the repair
    const allRepairs = await repairs.aggregate([
      { $match: { $or: [{ deviceId: { $in: deviceIds } }, { customerId: cId }] } },
      { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
      { $lookup: { from: 'users', localField: 'servicecenterId', foreignField: '_id', as: 'servicecenter' } },
      { $lookup: { from: 'users', localField: 'technicianId', foreignField: '_id', as: 'technician' } },
      { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$servicecenter', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$technician', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
    ]).toArray();

    return NextResponse.json({ success: true, repairs: allRepairs });
  } catch (error) {
    console.error('Customer repairs error:', error);
    return NextResponse.json({ error: 'Failed to fetch repairs' }, { status: 500 });
  }
}
