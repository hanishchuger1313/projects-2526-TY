import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');

    if (!shopId) {
      return NextResponse.json({ success: false, error: 'shopId required' }, { status: 400 });
    }

    const warranties = await getCollection('warranties');

    const result = await warranties.aggregate([
      { $match: { shopId: new ObjectId(shopId) } },
      {
        $lookup: {
          from: 'devices',
          localField: 'deviceId',
          foreignField: '_id',
          as: 'device',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      {
        $unwind: { path: '$device', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$customer', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          'customer.password': 0,
          'customer.passwordHash': 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]).toArray();

    const mapped = result.map((w) => {
      const now = new Date();
      const expiry = new Date(w.expiryDate);
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

      return {
        id: w._id.toString(),
        deviceId: w.deviceId?.toString(),
        customerId: w.customerId?.toString(),
        shopId: w.shopId?.toString(),
        startDate: w.startDate,
        expiryDate: w.expiryDate,
        warrantyPeriod: w.warrantyPeriod,
        status: w.status,
        terms: w.terms,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        device: w.device
          ? {
              brand: w.device.brand,
              model: w.device.model,
              imei: w.device.imei,
              storage: w.device.storage,
              color: w.device.color,
            }
          : null,
        customer: w.customer
          ? {
              name: w.customer.name,
              phone: w.customer.phone,
              email: w.customer.email,
            }
          : null,
        createdAt: w.createdAt,
      };
    });

    const stats = {
      total: mapped.length,
      active: mapped.filter((w) => w.status === 'active').length,
      expiringSoon: mapped.filter((w) => w.status === 'active' && w.daysLeft <= 30).length,
      expired: mapped.filter((w) => w.status === 'expired' || w.daysLeft <= 0).length,
    };

    return NextResponse.json({ success: true, warranties: mapped, stats });
  } catch (error) {
    console.error('Warranties GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { deviceId, customerId, shopId, warrantyPeriod = 12, terms = 'Standard warranty' } = body;

    if (!deviceId || !customerId || !shopId) {
      return NextResponse.json({ success: false, error: 'deviceId, customerId, shopId required' }, { status: 400 });
    }

    const warranties = await getCollection('warranties');
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setMonth(expiryDate.getMonth() + warrantyPeriod);

    const result = await warranties.insertOne({
      deviceId: new ObjectId(deviceId),
      customerId: new ObjectId(customerId),
      shopId: new ObjectId(shopId),
      startDate: now,
      expiryDate,
      warrantyPeriod,
      status: 'active',
      terms,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true, warrantyId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
