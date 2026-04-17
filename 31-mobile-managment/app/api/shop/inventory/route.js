import { NextResponse } from 'next/server';
import { InventoryModel } from '@/lib/models';
import { getCollection } from '@/lib/mongodb';
import { isValidImei, normalizeImei } from '@/lib/imei';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');

    if (!shopId) return NextResponse.json({ success: false, error: 'shopId required' }, { status: 400 });
    if (!ObjectId.isValid(shopId)) return NextResponse.json({ success: false, error: 'Invalid shopId' }, { status: 400 });

    const devicesCol = await getCollection('devices');
    const sId = new ObjectId(shopId);

    // Known old fake shopId used before auth was fixed
    const OLD_FAKE_SHOP_ID = '675a3b42c5d5e8f9a1234567';

    // If this is the first real shop logging in, reassign devices from the fake shopId
    if (ObjectId.isValid(OLD_FAKE_SHOP_ID)) {
      const fakeDevices = await devicesCol.find({
        shopId: new ObjectId(OLD_FAKE_SHOP_ID)
      }).toArray();

      if (fakeDevices.length > 0) {
        await devicesCol.updateMany(
          { shopId: new ObjectId(OLD_FAKE_SHOP_ID) },
          { $set: { shopId: sId, updatedAt: new Date() } }
        );
      }
    }

    // Also fix string-based shopIds
    await devicesCol.updateMany(
      { shopId: shopId },
      { $set: { shopId: sId, updatedAt: new Date() } }
    );

    const allDevices = await devicesCol.find({ shopId: sId })
      .sort({ createdAt: -1 }).toArray();

    const mapped = allDevices.map(d => ({
      id: d._id.toString(),
      imei: d.imei,
      brand: d.brand,
      model: d.model,
      color: d.color,
      storage: d.storage,
      ram: d.ram,
      purchasePrice: d.purchasePrice,
      sellingPrice: d.sellingPrice,
      warrantyPeriod: d.warrantyPeriod,
      status: d.status,
      createdAt: d.createdAt,
    }));

    const inStock = mapped.filter(d => d.status === 'in-stock');
    const stats = {
      total: mapped.length,
      inStock: inStock.length,
      totalValue: inStock.reduce((s, d) => s + (d.purchasePrice || 0), 0),
      potentialRevenue: inStock.reduce((s, d) => s + (d.sellingPrice || 0), 0),
    };

    return NextResponse.json({ success: true, devices: mapped, stats });
  } catch (error) {
    console.error('Inventory GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { shopId, imei, brand, model, color, storage, purchasePrice, sellingPrice, warrantyPeriod } = body;
    const normalizedImei = normalizeImei(imei);

    if (!shopId || !normalizedImei || !brand || !model) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (!isValidImei(normalizedImei)) {
      return NextResponse.json({ success: false, error: 'IMEI must be exactly 15 digits' }, { status: 400 });
    }

    const device = await InventoryModel.create({
      imei: normalizedImei, brand, model,
      color: color || '',
      storage: storage || '',
      purchasePrice: parseFloat(purchasePrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      warrantyPeriod: parseInt(warrantyPeriod) || 12,
    }, shopId);

    return NextResponse.json({ success: true, device: { id: device._id.toString(), ...device } }, { status: 201 });
  } catch (error) {
    console.error('Inventory POST error:', error);
    const status = error.message?.includes('IMEI already') ? 409 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { deviceId, shopId, ...updates } = body;

    if (!deviceId) return NextResponse.json({ success: false, error: 'deviceId required' }, { status: 400 });

    if (typeof updates.imei === 'string') {
      const normalizedImei = normalizeImei(updates.imei);
      if (!isValidImei(normalizedImei)) {
        return NextResponse.json({ success: false, error: 'IMEI must be exactly 15 digits' }, { status: 400 });
      }
      updates.imei = normalizedImei;
    }

    const device = await InventoryModel.update(deviceId, updates);
    if (!device) return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });

    return NextResponse.json({ success: true, device: { id: device._id.toString(), ...device } });
  } catch (error) {
    console.error('Inventory PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const shopId = searchParams.get('shopId');

    if (!deviceId || !shopId) return NextResponse.json({ success: false, error: 'deviceId and shopId required' }, { status: 400 });

    await InventoryModel.delete(deviceId, shopId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Inventory DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
