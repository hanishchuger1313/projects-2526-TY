import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Close repair and finalize bill
export async function POST(request) {
  try {
    const body = await request.json();
    const { repairId, paymentMethod, paidAmount, notes } = body;

    if (!repairId) {
      return NextResponse.json(
        { error: 'Repair ID is required' },
        { status: 400 }
      );
    }

    const repairs = await getCollection('repairs');
    const repair = await repairs.findOne({ _id: new ObjectId(repairId) });

    if (!repair) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 });
    }

    if (repair.repairStatus === 'delivered') {
      return NextResponse.json(
        { error: 'Repair already closed' },
        { status: 400 }
      );
    }

    if (!['completed', 'in-progress'].includes(repair.repairStatus)) {
      return NextResponse.json(
        { error: 'Repair must be in-progress or completed before closing' },
        { status: 400 }
      );
    }

    const finalPaidAmount = Number.isFinite(parseFloat(paidAmount))
      ? parseFloat(paidAmount)
      : (repair.finalBill || 0);

    // Update repair to completed/delivered
    await repairs.updateOne(
      { _id: new ObjectId(repairId) },
      {
        $set: {
          repairStatus: 'delivered',
          completionDate: new Date(),
          paymentMethod: paymentMethod || 'cash',
          paidAmount: finalPaidAmount,
          closingNotes: notes,
          closedAt: new Date(),
          updatedAt: new Date()
        },
        $push: {
          statusHistory: {
            status: 'delivered',
            changedAt: new Date(),
            changedBy: 'servicecenter',
            notes: notes || 'Repair closed and delivered'
          }
        }
      }
    );

    // Restore device status — 'sold' if there is an owner, else 'in-stock'
    const devices = await getCollection('devices');
    const hasOwner = repair.customerId || repair.ownerId;
    await devices.updateOne(
      { _id: repair.deviceId },
      {
        $set: {
          status: hasOwner ? 'sold' : 'in-stock',
          updatedAt: new Date()
        }
      }
    );

    // Create repair history entry
    const repairHistories = await getCollection('repair_histories');
    await repairHistories.insertOne({
      deviceId: repair.deviceId,
      repairId: repair._id,
      imei: repair.imei,
      customerId: repair.customerId,
      servicecenterId: repair.servicecenterId,
      technicianId: repair.technicianId,
      problemDescription: repair.problemDescription,
      parts: repair.parts || [],
      serviceCharges: repair.serviceCharges || [],
      totalCost: repair.actualCost,
      finalBill: repair.finalBill,
      warrantyApproved: repair.warrantyApproved,
      startDate: repair.startDate,
      completionDate: new Date(),
      createdAt: new Date()
    });

    // Create an in-app notification for customer portal.
    if (repair.customerId) {
      const notifications = await getCollection('notifications');
      await notifications.insertOne({
        userId: repair.customerId,
        type: 'repair-delivered',
        title: 'Repair Completed',
        message: `Your repair for IMEI ${repair.imei} is completed and delivered. Final bill: ${repair.finalBill || 0}.`,
        data: {
          repairId: repair._id,
          imei: repair.imei,
          finalBill: repair.finalBill || 0,
          paidAmount: finalPaidAmount,
          paymentMethod: paymentMethod || 'cash'
        },
        read: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Repair closed successfully',
      finalBill: repair.finalBill
    });
  } catch (error) {
    console.error('Close repair error:', error);
    return NextResponse.json(
      { error: 'Failed to close repair' },
      { status: 500 }
    );
  }
}
