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
    const warranties = await getCollection('warranties');
    const cId = new ObjectId(customerId);

    const allDevices = await devices.find({
      $or: [{ ownerId: cId }, { customerId: cId }]
    }).toArray();

    const deviceIds = allDevices.map(d => d._id);

    const allWarranties = await warranties.find({
      deviceId: { $in: deviceIds }
    }).toArray();

    // Enrich each warranty with device info and daysLeft
    const enriched = allWarranties.map(w => {
      const device = allDevices.find(d => d._id.toString() === w.deviceId.toString());
      const daysLeft = w.expiryDate
        ? Math.ceil((new Date(w.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;
      return { ...w, device: device || null, daysLeft };
    });

    return NextResponse.json({ success: true, warranties: enriched });
  } catch (error) {
    console.error('Customer warranties error:', error);
    return NextResponse.json({ error: 'Failed to fetch warranties' }, { status: 500 });
  }
}
