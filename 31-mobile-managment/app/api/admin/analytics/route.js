import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { UserModel, DeviceModel, SaleModel, RepairModel, WarrantyModel } from '@/lib/models';

// GET - Admin Dashboard Statistics
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    if (type === 'overview') {
      return await getDashboardOverview();
    } else if (type === 'sales') {
      return await getSalesAnalytics();
    } else if (type === 'repairs') {
      return await getRepairsAnalytics();
    } else if (type === 'warranties') {
      return await getWarrantiesAnalytics();
    } else if (type === 'fraud') {
      return await getFraudAnalytics();
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getDashboardOverview() {
  try {
    // Get user counts
    const userStats = await UserModel.getCountByStatus();

    // Get device counts
    const devices = await getCollection('devices');
    const totalDevices = await devices.countDocuments();
    const inStock = await devices.countDocuments({ status: 'in-stock' });
    const sold = await devices.countDocuments({ status: 'sold' });
    const underRepair = await devices.countDocuments({ status: 'under-repair' });
    const blacklisted = await devices.countDocuments({ status: 'blacklisted' });

    // Get warranty counts
    const warranties = await getCollection('warranties');
    const activeWarranties = await warranties.countDocuments({ status: 'active' });
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 30);
    const expiringSoon = await warranties.countDocuments({
      status: 'active',
      expiryDate: { $lte: expiringDate, $gte: new Date() }
    });

    // Get repair counts
    const repairs = await getCollection('repairs');
    const totalRepairs = await repairs.countDocuments();
    const openRepairs = await repairs.countDocuments({ 
      status: { $in: ['pending', 'in-progress'] } 
    });

    // Get sales stats
    const sales = await getCollection('sales');
    const totalSales = await sales.countDocuments();
    const salesStats = await sales.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$salePrice' },
          avgSaleValue: { $avg: '$salePrice' }
        }
      }
    ]).toArray();

    // Get monthly registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyDevices = await devices.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]).toArray();

    // Format monthly data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRegistrations = monthlyDevices.map(item => ({
      month: monthNames[item._id.month - 1],
      count: item.count
    }));

    // Device status distribution
    const devicesByStatus = [
      { name: 'In Stock', value: inStock, color: '#3b82f6' },
      { name: 'Sold', value: sold, color: '#22c55e' },
      { name: 'Under Repair', value: underRepair, color: '#f59e0b' },
      { name: 'Blacklisted', value: blacklisted, color: '#ef4444' }
    ];

    // Recent activities
    const recentSales = await sales.find().sort({ createdAt: -1 }).limit(5).toArray();
    const recentRepairs = await repairs.find().sort({ createdAt: -1 }).limit(5).toArray();

    return NextResponse.json({
      success: true,
      stats: {
        users: userStats,
        devices: {
          total: totalDevices,
          inStock,
          sold,
          underRepair,
          blacklisted
        },
        warranties: {
          active: activeWarranties,
          expiringSoon
        },
        repairs: {
          total: totalRepairs,
          open: openRepairs
        },
        sales: {
          total: totalSales,
          revenue: salesStats[0]?.totalRevenue || 0,
          avgValue: salesStats[0]?.avgSaleValue || 0
        }
      },
      charts: {
        monthlyRegistrations,
        devicesByStatus
      },
      recentActivities: {
        sales: recentSales,
        repairs: recentRepairs
      }
    });
  } catch (error) {
    throw error;
  }
}

async function getSalesAnalytics() {
  try {
    const sales = await getCollection('sales');
    const users = await getCollection('users');

    // Sales by shop
    const salesByShop = await sales.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'shopId',
          foreignField: '_id',
          as: 'shop'
        }
      },
      { $unwind: '$shop' },
      {
        $group: {
          _id: '$shopId',
          shopName: { $first: '$shop.shopName' },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$salePrice' },
          avgSaleValue: { $avg: '$salePrice' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]).toArray();

    // Sales trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySales = await sales.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$salePrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    return NextResponse.json({
      success: true,
      salesByShop,
      dailySales
    });
  } catch (error) {
    throw error;
  }
}

async function getRepairsAnalytics() {
  try {
    const repairs = await getCollection('repairs');

    // Repairs by service center
    const repairsByCenter = await repairs.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'serviceCenterId',
          foreignField: '_id',
          as: 'center'
        }
      },
      { $unwind: '$center' },
      {
        $group: {
          _id: '$serviceCenterId',
          centerName: { $first: '$center.centerName' },
          totalRepairs: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    // Repair status distribution
    const statusDistribution = await repairs.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Average repair time
    const avgRepairTime = await repairs.aggregate([
      {
        $match: { 
          status: 'completed',
          completedAt: { $exists: true }
        }
      },
      {
        $project: {
          repairDuration: {
            $divide: [
              { $subtract: ['$completedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$repairDuration' }
        }
      }
    ]).toArray();

    return NextResponse.json({
      success: true,
      repairsByCenter,
      statusDistribution,
      avgRepairTime: avgRepairTime[0]?.avgDays || 0
    });
  } catch (error) {
    throw error;
  }
}

async function getWarrantiesAnalytics() {
  try {
    const warranties = await getCollection('warranties');

    // Warranty status distribution
    const statusDistribution = await warranties.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Warranties expiring soon (next 30 days)
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const expiringSoon = await warranties.find({
      status: 'active',
      expiryDate: { $gte: today, $lte: thirtyDaysLater }
    }).sort({ expiryDate: 1 }).limit(20).toArray();

    // Warranty claims by month
    const claimedWarranties = await warranties.aggregate([
      {
        $match: { status: 'claimed' }
      },
      {
        $group: {
          _id: {
            year: { $year: '$claimedAt' },
            month: { $month: '$claimedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]).toArray();

    return NextResponse.json({
      success: true,
      statusDistribution,
      expiringSoon: expiringSoon.map(w => ({
        ...w,
        id: w._id.toString()
      })),
      claimedWarranties
    });
  } catch (error) {
    throw error;
  }
}

async function getFraudAnalytics() {
  try {
    const devices = await getCollection('devices');

    // Duplicate IMEI attempts
    const duplicateIMEIs = await devices.aggregate([
      {
        $group: {
          _id: '$imei',
          count: { $sum: 1 },
          devices: { $push: '$$ROOT' }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    // Blacklisted devices
    const blacklistedDevices = await devices.find({
      status: 'blacklisted'
    }).toArray();

    // Suspicious patterns (multiple devices from same shop in short time)
    const suspiciousActivity = await devices.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }
      },
      {
        $group: {
          _id: '$shopId',
          count: { $sum: 1 },
          devices: { $push: '$imei' }
        }
      },
      { $match: { count: { $gte: 10 } } } // 10+ devices in 24 hours
    ]).toArray();

    return NextResponse.json({
      success: true,
      duplicateIMEIs: duplicateIMEIs.map(d => ({
        imei: d._id,
        count: d.count,
        devices: d.devices
      })),
      blacklistedDevices: blacklistedDevices.map(d => ({
        ...d,
        id: d._id.toString()
      })),
      suspiciousActivity,
      alerts: {
        total: duplicateIMEIs.length + blacklistedDevices.length + suspiciousActivity.length,
        duplicates: duplicateIMEIs.length,
        blacklisted: blacklistedDevices.length,
        suspicious: suspiciousActivity.length
      }
    });
  } catch (error) {
    throw error;
  }
}
