import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const servicecenterId = searchParams.get('servicecenterId');

    if (!servicecenterId) {
      return NextResponse.json({ error: 'Service center ID is required' }, { status: 400 });
    }

    const repairs = await getCollection('repairs');
    const scId = new ObjectId(servicecenterId);

    const allRepairs = await repairs.aggregate([
      { $match: { servicecenterId: scId } },
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
      { $sort: { createdAt: -1 } }
    ]).toArray();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      total: allRepairs.length,
      pending: allRepairs.filter(r => r.repairStatus === 'pending').length,
      inProgress: allRepairs.filter(r => r.repairStatus === 'in-progress').length,
      waitingParts: allRepairs.filter(r => r.repairStatus === 'waiting-parts').length,
      completed: allRepairs.filter(r => r.repairStatus === 'completed').length,
      readyDelivery: allRepairs.filter(r => r.repairStatus === 'completed').length,
      delivered: allRepairs.filter(r => r.repairStatus === 'delivered').length,
      deliveredToday: allRepairs.filter(r =>
        r.repairStatus === 'delivered' &&
        r.closedAt && new Date(r.closedAt) >= startOfToday
      ).length,
      warrantyClaims: allRepairs.filter(r => r.warrantyApproved).length,
      totalRevenue: allRepairs
        .filter(r => r.repairStatus === 'delivered')
        .reduce((sum, r) => sum + (r.paidAmount || r.finalBill || 0), 0),
      monthlyRevenue: allRepairs
        .filter(r => r.repairStatus === 'delivered' && r.closedAt && new Date(r.closedAt) >= startOfMonth)
        .reduce((sum, r) => sum + (r.paidAmount || r.finalBill || 0), 0),
    };

    const recentRepairs = allRepairs.slice(0, 10).map(r => ({
      ...r,
      id: r._id.toString()
    }));

    return NextResponse.json({ success: true, stats, recentRepairs });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
