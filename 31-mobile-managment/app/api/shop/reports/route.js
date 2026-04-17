import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const period = parseInt(searchParams.get('period') || '30');

    if (!shopId || !ObjectId.isValid(shopId))
      return NextResponse.json({ success: false, error: 'Valid shopId required' }, { status: 400 });

    const sId = new ObjectId(shopId);
    const salesCol = await getCollection('sales');
    const devicesCol = await getCollection('devices');
    const warrantiesCol = await getCollection('warranties');

    // Get all deviceIds for this shop
    const shopDevices = await devicesCol.find({ shopId: sId }).toArray();
    const shopDeviceIds = shopDevices.map(d => d._id);

    const since = new Date();
    since.setDate(since.getDate() - period);

    // Sales in period — match by shopId OR by device belonging to this shop
    const sales = await salesCol.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
          $or: [{ shopId: sId }, { deviceId: { $in: shopDeviceIds } }]
        }
      },
      { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'deviceDoc' } },
      { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customerDoc' } },
      { $unwind: { path: '$deviceDoc', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$customerDoc', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
    ]).toArray();

    // Summary
    const totalRevenue = sales.reduce((sum, s) => sum + (s.salePrice || 0), 0);
    const totalCost = sales.reduce((sum, s) => sum + (s.deviceDoc?.purchasePrice || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

    // Daily chart
    const dailyMap = {};
    sales.forEach(s => {
      const day = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyMap[day]) dailyMap[day] = { day, revenue: 0, profit: 0 };
      dailyMap[day].revenue += s.salePrice || 0;
      dailyMap[day].profit += (s.salePrice || 0) - (s.deviceDoc?.purchasePrice || 0);
    });
    const dailyChart = Object.values(dailyMap).reverse();

    // Brand breakdown
    const brandMap = {};
    sales.forEach(s => {
      const brand = s.deviceDoc?.brand || 'Unknown';
      if (!brandMap[brand]) brandMap[brand] = { brand, count: 0, revenue: 0 };
      brandMap[brand].count++;
      brandMap[brand].revenue += s.salePrice || 0;
    });
    const brandBreakdown = Object.values(brandMap).sort((a, b) => b.count - a.count);

    // Inventory stats
    const statusGroups = {};
    shopDevices.forEach(d => {
      const s = d.status || 'unknown';
      if (!statusGroups[s]) statusGroups[s] = { status: s, count: 0, value: 0 };
      statusGroups[s].count++;
      statusGroups[s].value += d.sellingPrice || 0;
    });
    const inventoryStats = Object.values(statusGroups);

    // Warranty stats
    const now = new Date();
    const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const [active, expiringSoon, expired] = await Promise.all([
      warrantiesCol.countDocuments({ deviceId: { $in: shopDeviceIds }, expiryDate: { $gt: now } }),
      warrantiesCol.countDocuments({ deviceId: { $in: shopDeviceIds }, expiryDate: { $gt: now, $lt: soon } }),
      warrantiesCol.countDocuments({ deviceId: { $in: shopDeviceIds }, expiryDate: { $lte: now } }),
    ]);

    // Sales list for table
    const salesList = sales.map(s => ({
      id: s._id.toString(),
      invoiceNumber: s.invoiceNumber,
      device: `${s.deviceDoc?.brand || ''} ${s.deviceDoc?.model || ''}`.trim() || '—',
      customer: s.customerDoc?.name || s.customerName || '—',
      salePrice: s.salePrice || 0,
      purchasePrice: s.deviceDoc?.purchasePrice || 0,
      profit: (s.salePrice || 0) - (s.deviceDoc?.purchasePrice || 0),
      createdAt: s.createdAt,
    }));

    return NextResponse.json({
      success: true,
      summary: { totalRevenue, totalProfit, totalSales: sales.length, profitMargin },
      dailyChart,
      brandBreakdown,
      inventoryStats,
      warrantyStats: { active, expiringSoon, expired },
      sales: salesList,
    });
  } catch (error) {
    console.error('Shop reports error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
