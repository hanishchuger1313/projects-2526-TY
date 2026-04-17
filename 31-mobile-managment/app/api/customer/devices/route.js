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
    const warranties = await getCollection('warranties');

    const cId = new ObjectId(customerId);

    // Support both ownerId (transfer flow) and customerId (sale flow) fields
    const allDevices = await devices
      .find({ $or: [{ ownerId: cId }, { customerId: cId }] })
      .sort({ createdAt: -1 })
      .toArray();

    const enriched = await Promise.all(allDevices.map(async (device) => {
      // Warranty
      const warranty = await warranties.findOne({ deviceId: device._id });
      let warrantyDaysLeft = null;
      if (warranty?.expiryDate) {
        const diff = new Date(warranty.expiryDate) - new Date();
        warrantyDaysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }

      // Repair count
      const repairCount = await repairs.countDocuments({ deviceId: device._id });

      return { ...device, warrantyDaysLeft, warranty: warranty || null, repairCount };
    }));

    return NextResponse.json({ success: true, devices: enriched });
  } catch (error) {
    console.error('Customer devices error:', error);
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}
