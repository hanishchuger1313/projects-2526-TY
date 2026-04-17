import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

function getWarrantyDisplayAmount(repair) {
  // For warranty-approved jobs, customer bill can be 0 while actual repair cost is non-zero.
  return Number(
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

    if (!servicecenterId || !ObjectId.isValid(servicecenterId)) {
      return NextResponse.json({ error: 'Valid servicecenterId is required' }, { status: 400 });
    }

    const repairs = await getCollection('repairs');
    const scId = new ObjectId(servicecenterId);

    const warrantyRepairs = await repairs.aggregate([
      {
        $match: {
          servicecenterId: scId,
          warrantyClaimRequest: true
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
      { $sort: { createdAt: -1 } }
    ]).toArray();

    const stats = {
      totalClaims: warrantyRepairs.length,
      approved: warrantyRepairs.filter(r => r.warrantyApproved).length,
      pendingReview: warrantyRepairs.filter(r => !r.warrantyApproved && r.repairStatus === 'pending').length,
      completedUnderWarranty: warrantyRepairs.filter(r => r.warrantyApproved && ['completed', 'delivered'].includes(r.repairStatus)).length,
      rejectedOrPaid: warrantyRepairs.filter(r => !r.warrantyApproved && ['completed', 'delivered'].includes(r.repairStatus)).length,
    };

    return NextResponse.json({
      success: true,
      stats,
      claims: warrantyRepairs.map((r) => ({
        id: r._id.toString(),
        jobNumber: r.jobNumber,
        imei: r.imei,
        repairStatus: r.repairStatus,
        problemDescription: r.problemDescription,
        warrantyClaimRequest: Boolean(r.warrantyClaimRequest),
        warrantyApproved: Boolean(r.warrantyApproved),
        estimatedCost: r.estimatedCost || 0,
        actualCost: r.actualCost || 0,
        finalBill: r.finalBill || 0,
        displayAmount: getWarrantyDisplayAmount(r),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        device: r.device ? {
          brand: r.device.brand,
          model: r.device.model,
          color: r.device.color,
          storage: r.device.storage,
        } : null,
        customer: r.customer ? {
          name: r.customer.name,
          phone: r.customer.phone,
          email: r.customer.email,
        } : null,
      }))
    });
  } catch (error) {
    console.error('Service warranties GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch warranty claims' }, { status: 500 });
  }
}
