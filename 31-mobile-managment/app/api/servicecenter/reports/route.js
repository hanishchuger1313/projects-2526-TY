import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

function getRepairAmount(repair) {
  // Prefer paid amount when available, then final bill, then computed/estimated cost.
  return Number(
    repair.paidAmount ??
    repair.finalBill ??
    repair.actualCost ??
    repair.estimatedCost ??
    0
  ) || 0;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const servicecenterId = searchParams.get('servicecenterId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!servicecenterId || !ObjectId.isValid(servicecenterId)) {
      return NextResponse.json({ error: 'Valid servicecenterId is required' }, { status: 400 });
    }

    const repairs = await getCollection('repairs');
    const scId = new ObjectId(servicecenterId);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - (Number.isFinite(days) ? days : 30));

    const scopedRepairs = await repairs.aggregate([
      {
        $match: {
          servicecenterId: scId,
          createdAt: { $gte: fromDate }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'technicianId',
          foreignField: '_id',
          as: 'technician'
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
      { $unwind: { path: '$technician', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    const totalRepairs = scopedRepairs.length;
    const delivered = scopedRepairs.filter(r => r.repairStatus === 'delivered');
    const completed = scopedRepairs.filter(r => r.repairStatus === 'completed');
    const inProgress = scopedRepairs.filter(r => r.repairStatus === 'in-progress');
    const waitingParts = scopedRepairs.filter(r => r.repairStatus === 'waiting-parts');

    const billableRepairs = scopedRepairs.filter(r => ['completed', 'delivered'].includes(r.repairStatus));
    const revenue = billableRepairs.reduce((sum, r) => sum + getRepairAmount(r), 0);
    const avgBill = billableRepairs.length ? revenue / billableRepairs.length : 0;

    const technicianMap = new Map();
    const partsMap = new Map();

    scopedRepairs.forEach((repair) => {
      const techKey = repair.technicianId ? String(repair.technicianId) : 'unassigned';
      const techName = repair.technician?.name || 'Unassigned';
      if (!technicianMap.has(techKey)) {
        technicianMap.set(techKey, { id: techKey, name: techName, total: 0, completed: 0, delivered: 0 });
      }
      const tech = technicianMap.get(techKey);
      tech.total += 1;
      if (repair.repairStatus === 'completed') tech.completed += 1;
      if (repair.repairStatus === 'delivered') tech.delivered += 1;

      (repair.parts || []).forEach((part) => {
        const name = part.name || 'Unknown Part';
        if (!partsMap.has(name)) {
          partsMap.set(name, { name, quantity: 0, amount: 0 });
        }
        const bucket = partsMap.get(name);
        bucket.quantity += part.quantity || 0;
        bucket.amount += part.totalPrice || 0;
      });
    });

    const technicianPerformance = Array.from(technicianMap.values())
      .sort((a, b) => b.total - a.total);

    const partUsage = Array.from(partsMap.values())
      .sort((a, b) => b.quantity - a.quantity);

    return NextResponse.json({
      success: true,
      summary: {
        totalRepairs,
        delivered: delivered.length,
        completed: completed.length,
        inProgress: inProgress.length,
        waitingParts: waitingParts.length,
        totalRevenue: revenue,
        averageBill: avgBill,
      },
      technicianPerformance,
      partUsage,
      recentRepairs: scopedRepairs.slice(0, 20).map((r) => ({
        id: r._id.toString(),
        jobNumber: r.jobNumber,
        imei: r.imei,
        repairStatus: r.repairStatus,
        finalBill: r.finalBill || 0,
        actualCost: r.actualCost || 0,
        estimatedCost: r.estimatedCost || 0,
        paidAmount: r.paidAmount || 0,
        displayAmount: getRepairAmount(r),
        createdAt: r.createdAt,
        device: r.device ? `${r.device.brand || ''} ${r.device.model || ''}`.trim() : 'Unknown Device',
        technician: r.technician?.name || 'Unassigned',
      }))
    });
  } catch (error) {
    console.error('Service reports GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
