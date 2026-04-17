import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!shopId) {
      return NextResponse.json(
        { error: 'Shop ID is required' },
        { status: 400 }
      );
    }

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const devices = await getCollection('devices');
    const sales = await getCollection('sales');
    const warranties = await getCollection('warranties');

    // Get all devices for this shop
    const allDevices = await devices.find({ shopId: new ObjectId(shopId) }).toArray();
    
    // Get sales data with aggregation
    const salesData = await sales.aggregate([
      {
        $match: {
          shopId: new ObjectId(shopId),
          saleDate: { $gte: dateFrom }
        }
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'deviceId',
          foreignField: '_id',
          as: 'device'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      { $sort: { saleDate: -1 } }
    ]).toArray();

    // Calculate analytics
    const totalSales = salesData.length;
    const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.salePrice || 0), 0);
    const totalCost = salesData.reduce((sum, sale) => sum + (sale.purchasePrice || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const averageMargin = totalCost > 0 ? ((totalProfit / totalCost) * 100) : 0;

    // Devices in stock
    const devicesInStock = allDevices.filter(d => d.status === 'in-stock').length;
    const devicesSold = allDevices.filter(d => d.status === 'sold' || d.status === 'resold').length;

    // Active warranties
    const activeWarrantiesCount = await warranties.countDocuments({
      shopId: new ObjectId(shopId),
      status: 'active'
    });

    // Top selling devices
    const deviceSalesMap = {};
    salesData.forEach(sale => {
      const key = `${sale.device?.brand} ${sale.device?.model}`;
      if (!deviceSalesMap[key]) {
        deviceSalesMap[key] = {
          brand: sale.device?.brand,
          model: sale.device?.model,
          count: 0,
          revenue: 0
        };
      }
      deviceSalesMap[key].count++;
      deviceSalesMap[key].revenue += sale.salePrice || 0;
    });

    const topSellingDevices = Object.values(deviceSalesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Sales by day
    const salesByDayMap = {};
    salesData.forEach(sale => {
      const date = new Date(sale.saleDate).toLocaleDateString();
      salesByDayMap[date] = (salesByDayMap[date] || 0) + 1;
    });

    const salesByDay = Object.entries(salesByDayMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);

    // Recent sales
    const recentSales = salesData.slice(0, 10);

    const analytics = {
      totalSales,
      totalRevenue,
      totalProfit,
      averageMargin,
      devicesInStock,
      devicesSold,
      activeWarranties: activeWarrantiesCount,
      topSellingDevices,
      recentSales,
      salesByDay
    };

    return NextResponse.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
