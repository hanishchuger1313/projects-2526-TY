import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET — list assigned repairs OR single repair
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const technicianId = searchParams.get('technicianId');
    const repairId = searchParams.get('repairId');

    if (!technicianId) return NextResponse.json({ error: 'technicianId required' }, { status: 400 });
    if (!ObjectId.isValid(technicianId)) return NextResponse.json({ error: 'Invalid technicianId' }, { status: 400 });
    if (repairId && !ObjectId.isValid(repairId)) return NextResponse.json({ error: 'Invalid repairId' }, { status: 400 });

    const repairs = await getCollection('repairs');
    const tId = new ObjectId(technicianId);

    // Single repair — verify it belongs to this technician
    if (repairId) {
      const results = await repairs.aggregate([
        { $match: { _id: new ObjectId(repairId), technicianId: tId } },
        { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
        { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customer' } },
        { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      ]).toArray();

      if (!results.length) return NextResponse.json({ error: 'Repair not found or not assigned to you' }, { status: 404 });
      const item = results[0];
      return NextResponse.json({
        success: true,
        repair: {
          ...item,
          _id: item._id.toString(),
          id: item._id.toString(),
          technicianId: item.technicianId ? item.technicianId.toString() : null,
          customerId: item.customerId ? item.customerId.toString() : null,
          deviceId: item.deviceId ? item.deviceId.toString() : null,
        }
      });
    }

    // All repairs for technician
    const allRepairs = await repairs.aggregate([
      { $match: { technicianId: tId } },
      { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
      { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customer' } },
      { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    return NextResponse.json({
      success: true,
      repairs: allRepairs.map((r) => ({
        ...r,
        _id: r._id.toString(),
        id: r._id.toString(),
        technicianId: r.technicianId ? r.technicianId.toString() : null,
        customerId: r.customerId ? r.customerId.toString() : null,
        deviceId: r.deviceId ? r.deviceId.toString() : null,
      }))
    });
  } catch (error) {
    console.error('Technician GET repairs error:', error);
    return NextResponse.json({ error: 'Failed to fetch repairs' }, { status: 500 });
  }
}

// PATCH — update status and/or technical report fields ONLY
// ⚠ Cannot modify: customerId, warrantyApproved, serviceCharges, finalBill, paidAmount
const ALLOWED_PATCH_FIELDS = [
  'repairStatus',
  'faultReason',
  'workDone',
  'technicianNotes',
];

const VALID_STATUSES = ['pending', 'in-progress', 'waiting-parts', 'completed'];

export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const repairId = searchParams.get('repairId');
    if (!repairId) return NextResponse.json({ error: 'repairId required' }, { status: 400 });
    if (!ObjectId.isValid(repairId)) return NextResponse.json({ error: 'Invalid repairId' }, { status: 400 });

    const body = await request.json();
    const { technicianId, ...fields } = body;

    if (!technicianId) return NextResponse.json({ error: 'technicianId required' }, { status: 400 });
    if (!ObjectId.isValid(technicianId)) return NextResponse.json({ error: 'Invalid technicianId' }, { status: 400 });

    const repairs = await getCollection('repairs');
    const devices = await getCollection('devices');
    const tId = new ObjectId(technicianId);
    const rId = new ObjectId(repairId);

    // Verify ownership
    const existing = await repairs.findOne({ _id: rId, technicianId: tId });
    if (!existing) return NextResponse.json({ error: 'Repair not found or not assigned to you' }, { status: 404 });

    // Block modifications to closed repairs
    if (existing.repairStatus === 'delivered') {
      return NextResponse.json({ error: 'Cannot modify a delivered repair' }, { status: 403 });
    }

    // Only allow whitelisted fields
    const update = {};
    for (const key of ALLOWED_PATCH_FIELDS) {
      if (fields[key] !== undefined) update[key] = fields[key];
    }

    // Validate status transitions
    if (update.repairStatus) {
      if (!VALID_STATUSES.includes(update.repairStatus)) {
        return NextResponse.json({ error: 'Invalid status. Technicians cannot set delivered.' }, { status: 400 });
      }

      // Marking completed requires technical report fields to be available.
      if (update.repairStatus === 'completed') {
        const faultReason = (update.faultReason ?? existing.faultReason ?? '').trim();
        const workDone = (update.workDone ?? existing.workDone ?? '').trim();
        if (!faultReason || !workDone) {
          return NextResponse.json({
            error: 'Fault reason and work done are required before marking completed'
          }, { status: 400 });
        }
      }
    }

    if (!Object.keys(update).length) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    update.updatedAt = new Date();

    const patch = { $set: update };
    if (update.repairStatus && update.repairStatus !== existing.repairStatus) {
      patch.$push = {
        statusHistory: {
          status: update.repairStatus,
          changedAt: new Date(),
          changedBy: 'technician',
          notes: update.technicianNotes || 'Updated by technician'
        }
      };
    }

    await repairs.updateOne({ _id: rId }, patch);

    if (update.repairStatus) {
      let nextDeviceStatus = 'under-repair';
      if (update.repairStatus === 'completed') {
        const deviceDoc = await devices.findOne({ _id: existing.deviceId });
        const hasOwner = Boolean(deviceDoc?.customerId || deviceDoc?.ownerId || existing.customerId);
        nextDeviceStatus = hasOwner ? 'sold' : 'in-stock';
      }
      await devices.updateOne(
        { _id: existing.deviceId },
        { $set: { status: nextDeviceStatus, updatedAt: new Date() } }
      );
    }

    return NextResponse.json({ success: true, message: 'Repair updated' });
  } catch (error) {
    console.error('Technician PATCH repairs error:', error);
    return NextResponse.json({ error: 'Failed to update repair' }, { status: 500 });
  }
}
