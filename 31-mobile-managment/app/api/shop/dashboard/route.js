import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    if (!shopId) return NextResponse.json({ success: false, error: 'shopId required' }, { status: 400 });

    const shopOId = new ObjectId(shopId);
    const [salesCol, devicesCol, warrantiesCol] = await Promise.all([
      getCollection('sales'),
      getCollection('devices'),
      getCollection('warranties'),
    ]);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const soon = new Date(now); soon.setDate(soon.getDate() + 30);

    // All sales
    const allSales = await salesCol.find({ shopId: shopOId }).toArray();
    const totalRevenue = allSales.reduce((s, x) => s + (x.salePrice || 0), 0);
    const todayRevenue = allSales.filter(x => new Date(x.createdAt) >= todayStart).reduce((s, x) => s + (x.salePrice || 0), 0);
    const monthSales = allSales.filter(x => new Date(x.createdAt) >= monthStart).length;

    // Inventory stats
    const invStats = await devicesCol.aggregate([
      { $match: { shopId: shopOId } },
      { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$sellingPrice' } } }
    ]).toArray();
    const inStockCount = invStats.find(s => s._id === 'in-stock')?.count || 0;
    const stockValue = invStats.find(s => s._id === 'in-stock')?.value || 0;
    const soldCount = invStats.find(s => s._id === 'sold')?.count || 0;

    // Warranty stats
    const [activeWarranties, expiringSoon] = await Promise.all([
      warrantiesCol.countDocuments({ shopId: shopOId, status: 'active' }),
      warrantiesCol.countDocuments({ shopId: shopOId, status: 'active', expiryDate: { $lte: soon, $gte: now } }),
    ]);

    // Unique customers
    const uniqueCustomers = await salesCol.distinct('customerId', { shopId: shopOId });

    // Revenue chart — last 6 months
    const revenueAgg = await salesCol.aggregate([
      { $match: { shopId: shopOId, createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$salePrice' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]).toArray();
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const revenueChart = revenueAgg.map(r => ({ month: monthNames[r._id.month - 1], revenue: r.revenue }));

    // Top 5 devices
    const topDevicesAgg = await salesCol.aggregate([
      { $match: { shopId: shopOId } },
      { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
      { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
      { $group: { _id: { brand: '$device.brand', model: '$device.model' }, count: { $sum: 1 }, revenue: { $sum: '$salePrice' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();
    const topDevices = topDevicesAgg.map(d => ({
      name: d._id.brand && d._id.model ? `${d._id.brand} ${d._id.model}` : 'Unknown',
      count: d.count,
      revenue: d.revenue,
    }));

    // Recent 10 sales
    const recentSalesRaw = await salesCol.aggregate([
      { $match: { shopId: shopOId } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
      { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customer' } },
      { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    ]).toArray();
    const recentSales = recentSalesRaw.map(s => ({
      id: s._id.toString(),
      invoiceNumber: s.invoiceNumber,
      device: s.device ? `${s.device.brand} ${s.device.model}` : 'Unknown',
      customer: s.customer?.name || s.customerName || 'Unknown',
      salePrice: s.salePrice,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue, todayRevenue,
        totalSales: allSales.length, monthSales,
        inStockCount, stockValue, soldCount,
        activeWarranties, expiringSoon,
        totalCustomers: uniqueCustomers.length,
      },
      revenueChart,
      topDevices,
      recentSales,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
