import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const realShopId = searchParams.get('realShopId');

    const devicesCol = await getCollection('devices');
    const salesCol = await getCollection('sales');

    const deviceShopIds = await devicesCol.distinct('shopId');
    const salesShopIds = await salesCol.distinct('shopId');

    const allDevices = await devicesCol.find({}).project({ _id: 1, imei: 1, brand: 1, model: 1, shopId: 1, status: 1 }).toArray();
    const allSales = await salesCol.find({}).project({ _id: 1, shopId: 1, invoiceNumber: 1 }).toArray();

    let migrated = null;
    if (realShopId && ObjectId.isValid(realShopId)) {
      const sId = new ObjectId(realShopId);
      const otherShopIds = deviceShopIds.filter(id => id?.toString() !== realShopId);

      if (otherShopIds.length > 0) {
        const deviceResult = await devicesCol.updateMany(
          { shopId: { $in: otherShopIds } },
          { $set: { shopId: sId, updatedAt: new Date() } }
        );
        const salesResult = await salesCol.updateMany(
          { shopId: { $in: otherShopIds } },
          { $set: { shopId: sId, updatedAt: new Date() } }
        );
        migrated = {
          devicesUpdated: deviceResult.modifiedCount,
          salesUpdated: salesResult.modifiedCount,
          fromShopIds: otherShopIds.map(id => id?.toString()),
        };
      } else {
        migrated = { message: 'No migration needed — all records already use the correct shopId' };
      }
    }

    return NextResponse.json({
      deviceShopIds: deviceShopIds.map(id => id?.toString()),
      salesShopIds: salesShopIds.map(id => id?.toString()),
      devices: allDevices.map(d => ({ ...d, _id: d._id.toString(), shopId: d.shopId?.toString() })),
      sales: allSales.map(s => ({ ...s, _id: s._id.toString(), shopId: s.shopId?.toString() })),
      migrated,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
