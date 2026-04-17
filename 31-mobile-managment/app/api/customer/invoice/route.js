import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/customer/invoice?type=repair&id=<repairId>&customerId=<id>
// GET /api/customer/invoice?type=purchase&id=<deviceId>&customerId=<id>
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');       // 'repair' | 'purchase'
    const id = searchParams.get('id');
    const customerId = searchParams.get('customerId');
    if (!customerId || !ObjectId.isValid(customerId))
      return NextResponse.json({ error: 'Valid customerId required' }, { status: 400 });

    if (!type || !id || !customerId) {
      return NextResponse.json({ error: 'type, id and customerId are required' }, { status: 400 });
    }

    const cId = new ObjectId(customerId);

    if (type === 'repair') {
      const repairs = await getCollection('repairs');
      const devices = await getCollection('devices');

      const results = await repairs.aggregate([
        { $match: { _id: new ObjectId(id) } },
        { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
        { $lookup: { from: 'users', localField: 'servicecenterId', foreignField: '_id', as: 'servicecenter' } },
        { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customer' } },
        { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$servicecenter', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      ]).toArray();

      if (!results.length) return NextResponse.json({ error: 'Repair not found' }, { status: 404 });

      const repair = results[0];
      // Verify this repair belongs to the customer's device
      const device = await devices.findOne({ _id: repair.deviceId, ownerId: cId });
      if (!device) return NextResponse.json({ error: 'Unauthorised' }, { status: 403 });

      return NextResponse.json({ success: true, type: 'repair', data: repair });
    }

    if (type === 'purchase') {
      const devices = await getCollection('devices');
      const sales = await getCollection('sales');

      const device = await devices.findOne({ _id: new ObjectId(id), ownerId: cId });
      if (!device) return NextResponse.json({ error: 'Device not found or not yours' }, { status: 404 });

      const sale = await sales.findOne({ deviceId: new ObjectId(id) });

      return NextResponse.json({ success: true, type: 'purchase', data: { device, sale } });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Customer invoice error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice data' }, { status: 500 });
  }
}
