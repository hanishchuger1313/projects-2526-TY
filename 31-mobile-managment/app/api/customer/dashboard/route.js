import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    if (!customerId || !ObjectId.isValid(customerId)) 
      return NextResponse.json({ error: 'Valid customerId required' }, { status: 400 });

    const devices = await getCollection('devices');
    const repairs = await getCollection('repairs');
    const warranties = await getCollection('warranties');

    const cId = new ObjectId(customerId);

    const allDevices = await devices.find({
      $or: [{ ownerId: cId }, { customerId: cId }]
    }).toArray();
    const deviceIds = allDevices.map(d => d._id);

    const now = new Date();

    // Active warranties
    const activeWarranties = await warranties.countDocuments({
      deviceId: { $in: deviceIds },
      expiryDate: { $gt: now },
    });

    // Expiring soon (within 30 days)
    const expiringSoon = await warranties.countDocuments({
      deviceId: { $in: deviceIds },
      expiryDate: { $gt: now, $lt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
    });

    // Repair stats
    const allRepairs = await repairs.find({ deviceId: { $in: deviceIds } }).toArray();
    const activeRepairs = allRepairs.filter(r => ['pending', 'in-progress', 'waiting-parts'].includes(r.repairStatus));
    const completedRepairs = allRepairs.filter(r => r.repairStatus === 'delivered');

    // Pending transfers
    const transfers = await getCollection('ownershiptransfers');
    const pendingTransfers = await transfers.countDocuments({ toUserId: cId, status: 'pending' });

    // Recent repairs (5 most recent)
    const recentRepairs = await repairs.aggregate([
      { $match: { deviceId: { $in: deviceIds } } },
      { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
      { $lookup: { from: 'users', localField: 'servicecenterId', foreignField: '_id', as: 'servicecenter' } },
      { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$servicecenter', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
    ]).toArray();

    return NextResponse.json({
      success: true,
      stats: {
        totalDevices: allDevices.length,
        activeWarranties,
        expiringSoon,
        activeRepairs: activeRepairs.length,
        completedRepairs: completedRepairs.length,
        totalRepairs: allRepairs.length,
        pendingTransfers,
      },
      recentRepairs,
    });
  } catch (error) {
    console.error('Customer dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}
