import { NextResponse } from 'next/server';
import { TransactionModel, UserModel } from '@/lib/models';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Process sale
export async function POST(request) {
  try {
    const body = await request.json();
    const { shopId, deviceId, customerId, salePrice } = body;

    if (!shopId || !deviceId || !customerId || !salePrice) {
      return NextResponse.json(
        { success: false, error: 'shopId, deviceId, customerId and salePrice are required' },
        { status: 400 }
      );
    }

    // Fetch customer details from DB
    const customer = await UserModel.findById(customerId);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const result = await TransactionModel.createSale({
      shopId,
      deviceId,
      customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email || '',
      salePrice: parseFloat(salePrice),
    });

    return NextResponse.json({ success: true, sale: { id: result.sale._id.toString(), ...result.sale } }, { status: 201 });
  } catch (error) {
    console.error('Sales POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET - Fetch sales history
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');

    if (!shopId || !ObjectId.isValid(shopId))
      return NextResponse.json({ error: 'Valid shopId required' }, { status: 400 });

    const sales = await getCollection('sales');
    const devices = await getCollection('devices');
    const sId = new ObjectId(shopId);

    const OLD_FAKE_SHOP_ID = '675a3b42c5d5e8f9a1234567';

    // One-time migration: reassign sales saved with old fake shopId
    if (ObjectId.isValid(OLD_FAKE_SHOP_ID)) {
      await sales.updateMany(
        { shopId: new ObjectId(OLD_FAKE_SHOP_ID) },
        { $set: { shopId: sId, updatedAt: new Date() } }
      );
    }
    // Fix string-based shopIds too
    await sales.updateMany(
      { shopId: shopId },
      { $set: { shopId: sId, updatedAt: new Date() } }
    );

    // Get all deviceIds that belong to this shop
    const shopDevices = await devices.find({ shopId: sId }).project({ _id: 1 }).toArray();
    const shopDeviceIds = shopDevices.map(d => d._id);

    // Match sales either by shopId field OR by device belonging to this shop
    const allSales = await sales.aggregate([
      {
        $match: {
          $or: [
            { shopId: sId },
            { deviceId: { $in: shopDeviceIds } }
          ]
        }
      },
      { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
      { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customer' } },
      { $lookup: { from: 'warranties', localField: 'deviceId', foreignField: 'deviceId', as: 'warranty' } },
      { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$warranty', preserveNullAndEmptyArrays: true } },
      { $project: { 'customer.password': 0, 'customer.passwordHash': 0 } },
      { $sort: { createdAt: -1 } },
    ]).toArray();

    const normalized = allSales.map(s => ({
      ...s,
      id: s._id?.toString(),
      device: s.device ? { ...s.device, id: s.device._id?.toString() } : null,
    }));

    return NextResponse.json({ success: true, sales: normalized });
  } catch (error) {
    console.error('Shop sales GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}
