import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET — raise a repair request
// POST — submit repair request
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, deviceId, imei, problemDescription, preferredDate } = body;

    if (!customerId || !deviceId || !problemDescription) {
      return NextResponse.json({ error: 'customerId, deviceId and problemDescription are required' }, { status: 400 });
    }

    const devices = await getCollection('devices');
    const repairRequests = await getCollection('repairrequests');
    const cId = new ObjectId(customerId);
    const dId = new ObjectId(deviceId);

    // Verify device belongs to customer
    const device = await devices.findOne({ _id: dId, ownerId: cId });
    if (!device) return NextResponse.json({ error: 'Device not found or not yours' }, { status: 404 });

    // Check for duplicate open request
    const existing = await repairRequests.findOne({
      deviceId: dId, customerId: cId, status: { $in: ['pending', 'acknowledged'] }
    });
    if (existing) return NextResponse.json({ error: 'You already have an open repair request for this device' }, { status: 409 });

    const requestDoc = {
      customerId: cId,
      deviceId: dId,
      imei: imei || device.imei,
      problemDescription: problemDescription.trim(),
      preferredDate: preferredDate ? new Date(preferredDate) : null,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await repairRequests.insertOne(requestDoc);
    return NextResponse.json({ success: true, requestId: result.insertedId, message: 'Repair request submitted' }, { status: 201 });
  } catch (error) {
    console.error('Customer service request error:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    if (!customerId) return NextResponse.json({ error: 'customerId required' }, { status: 400 });

    const repairRequests = await getCollection('repairrequests');
    const cId = new ObjectId(customerId);

    const requests = await repairRequests.aggregate([
      { $match: { customerId: cId } },
      { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
      { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
    ]).toArray();

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Customer service request GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}
