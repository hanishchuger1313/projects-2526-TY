import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const technicianId = searchParams.get('technicianId');
    if (!technicianId) return NextResponse.json({ error: 'technicianId required' }, { status: 400 });
    if (!ObjectId.isValid(technicianId)) return NextResponse.json({ error: 'Invalid technicianId' }, { status: 400 });

    const repairs = await getCollection('repairs');
    const tId = new ObjectId(technicianId);

    const allRepairs = await repairs.aggregate([
      { $match: { technicianId: tId } },
      {
        $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' }
      },
      {
        $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customer' }
      },
      { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    const stats = {
      total: allRepairs.length,
      pending: allRepairs.filter(r => r.repairStatus === 'pending').length,
      inProgress: allRepairs.filter(r => r.repairStatus === 'in-progress').length,
      waitingParts: allRepairs.filter(r => r.repairStatus === 'waiting-parts').length,
      completed: allRepairs.filter(r => r.repairStatus === 'completed').length,
      delivered: allRepairs.filter(r => r.repairStatus === 'delivered').length,
    };

    const recentRepairs = allRepairs.slice(0, 10).map((r) => ({
      ...r,
      _id: r._id.toString(),
      id: r._id.toString(),
      technicianId: r.technicianId ? r.technicianId.toString() : null,
      customerId: r.customerId ? r.customerId.toString() : null,
      deviceId: r.deviceId ? r.deviceId.toString() : null,
    }));

    return NextResponse.json({ success: true, stats, recentRepairs });
  } catch (error) {
    console.error('Technician dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}
