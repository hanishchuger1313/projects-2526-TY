import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { isValidImei, normalizeImei } from '@/lib/imei';

const SERVICE_ALLOWED_STATUSES = ['pending', 'in-progress', 'waiting-parts', 'completed'];

// POST - Create new repair entry
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      deviceId,
      imei,
      problemDescription,
      estimatedCost,
      warrantyClaimRequest,
      technicianId,
      servicecenterId,
      customerComplaints
    } = body;

    // Validation
    if (!deviceId || !problemDescription || !servicecenterId) {
      return NextResponse.json(
        { error: 'Device ID, problem description, and service center ID are required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(deviceId) || !ObjectId.isValid(servicecenterId)) {
      return NextResponse.json(
        { error: 'Invalid device or service center ID' },
        { status: 400 }
      );
    }

    if (technicianId && !ObjectId.isValid(technicianId)) {
      return NextResponse.json(
        { error: 'Invalid technician ID' },
        { status: 400 }
      );
    }

    const devices = await getCollection('devices');
    const device = await devices.findOne({ _id: new ObjectId(deviceId) });

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    const normalizedImei = normalizeImei(imei || device.imei || '');
    if (!isValidImei(normalizedImei)) {
      return NextResponse.json({ error: 'IMEI must be exactly 15 digits' }, { status: 400 });
    }

    if (device.status === 'stolen' || device.status === 'lost') {
      return NextResponse.json(
        { error: `Cannot create repair for a ${device.status} device` },
        { status: 400 }
      );
    }

    // Check warranty if claim requested
    let warrantyApproved = false;
    const shouldCheckWarranty = Boolean(warrantyClaimRequest || body.warrantyApproved);
    if (shouldCheckWarranty) {
      const warranties = await getCollection('warranties');
      const warranty = await warranties.findOne({
        deviceId: new ObjectId(deviceId),
        status: 'active'
      });

      if (warranty) {
        const now = new Date();
        const expiryDate = new Date(warranty.expiryDate);
        if (expiryDate > now) {
          warrantyApproved = true;
        }
      }
    }

    // Create repair entry
    const repairs = await getCollection('repairs');
    const repairData = {
      deviceId: new ObjectId(deviceId),
      imei: normalizedImei,
      customerId: device.customerId,
      shopId: device.shopId,
      servicecenterId: new ObjectId(servicecenterId),
      technicianId: technicianId ? new ObjectId(technicianId) : null,
      problemDescription,
      customerComplaints: customerComplaints || problemDescription,
      estimatedCost: parseFloat(estimatedCost) || 0,
      actualCost: 0,
      warrantyClaimRequest: warrantyClaimRequest || false,
      warrantyApproved,
      status: 'pending',
      repairStatus: 'pending',
      statusHistory: [{
        status: 'pending',
        changedAt: new Date(),
        changedBy: 'servicecenter',
        notes: 'Repair job created'
      }],
      parts: [],
      serviceCharges: [],
      totalPartsCost: 0,
      totalServiceCharge: 0,
      finalBill: 0,
      jobNumber: `JOB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      startDate: new Date(),
      expectedCompletionDate: null,
      completionDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await repairs.insertOne(repairData);

    // Update device status
    await devices.updateOne(
      { _id: new ObjectId(deviceId) },
      {
        $set: {
          status: 'under-repair',
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Repair entry created successfully',
      repair: {
        ...repairData,
        id: result.insertedId.toString(),
        _id: result.insertedId.toString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Create repair error:', error);
    return NextResponse.json(
      { error: 'Failed to create repair entry' },
      { status: 500 }
    );
  }
}

// GET - Fetch repairs
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const servicecenterId = searchParams.get('servicecenterId');
    const repairId = searchParams.get('repairId');
    const status = searchParams.get('status');

    if (!servicecenterId && !repairId) {
      return NextResponse.json(
        { error: 'Service center ID or Repair ID is required' },
        { status: 400 }
      );
    }

    if (repairId && !ObjectId.isValid(repairId)) {
      return NextResponse.json({ error: 'Invalid repairId' }, { status: 400 });
    }
    if (servicecenterId && !ObjectId.isValid(servicecenterId)) {
      return NextResponse.json({ error: 'Invalid servicecenterId' }, { status: 400 });
    }

    const repairs = await getCollection('repairs');
    let query = {};

    if (repairId) {
      query._id = new ObjectId(repairId);
    } else {
      query.servicecenterId = new ObjectId(servicecenterId);
      if (status && status !== 'all') {
        query.repairStatus = status;
      }
    }

    const repairList = await repairs.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'devices',
          localField: 'deviceId',
          foreignField: '_id',
          as: 'deviceDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'technicianId',
          foreignField: '_id',
          as: 'technicianDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'servicecenterId',
          foreignField: '_id',
          as: 'servicecenterDetails'
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    return NextResponse.json({
      success: true,
      repairs: repairList.map(r => ({
        ...r,
        _id: r._id.toString(),
        id: r._id.toString()
      }))
    });
  } catch (error) {
    console.error('Fetch repairs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repairs' },
      { status: 500 }
    );
  }
}

// PATCH - Update repair status
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const repairId = searchParams.get('repairId');
    const body = await request.json();

    if (!repairId) {
      return NextResponse.json(
        { error: 'Repair ID is required' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(repairId)) {
      return NextResponse.json({ error: 'Invalid repairId' }, { status: 400 });
    }

    const repairs = await getCollection('repairs');
    const devices = await getCollection('devices');
    const existingRepair = await repairs.findOne({ _id: new ObjectId(repairId) });
    if (!existingRepair) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 });
    }
    if (existingRepair.repairStatus === 'delivered') {
      return NextResponse.json({ error: 'Delivered repair cannot be modified' }, { status: 403 });
    }

    const updateData = {};
    const statusHistoryEntry = {};

    if (body.repairStatus) {
      if (!SERVICE_ALLOWED_STATUSES.includes(body.repairStatus)) {
        return NextResponse.json(
          { error: 'Invalid repair status for service center update' },
          { status: 400 }
        );
      }
      updateData.repairStatus = body.repairStatus;
      if (body.repairStatus === 'in-progress' && !existingRepair.startDate) {
        updateData.startDate = new Date();
      }
      if (body.repairStatus === 'completed') {
        updateData.completionDate = new Date();
      }
      statusHistoryEntry.status = body.repairStatus;
      statusHistoryEntry.changedAt = new Date();
      statusHistoryEntry.changedBy = 'servicecenter';
    }

    if (body.technicianId) {
      if (!ObjectId.isValid(body.technicianId)) {
        return NextResponse.json({ error: 'Invalid technicianId' }, { status: 400 });
      }
      updateData.technicianId = new ObjectId(body.technicianId);
      statusHistoryEntry.notes = 'Technician assigned';
    }

    updateData.updatedAt = new Date();

    const updateDoc = { $set: updateData };
    if (statusHistoryEntry.status) {
      updateDoc.$push = { statusHistory: statusHistoryEntry };
    }

    await repairs.updateOne(
      { _id: new ObjectId(repairId) },
      updateDoc
    );

    const effectiveStatus = updateData.repairStatus || existingRepair.repairStatus;
    let nextDeviceStatus = 'under-repair';
    if (effectiveStatus === 'completed') {
      const deviceDoc = await devices.findOne({ _id: existingRepair.deviceId });
      const hasOwner = Boolean(deviceDoc?.customerId || deviceDoc?.ownerId || existingRepair.customerId);
      nextDeviceStatus = hasOwner ? 'sold' : 'in-stock';
    }

    // Keep device under repair for active statuses, release on completion.
    await devices.updateOne(
      { _id: existingRepair.deviceId },
      { $set: { status: nextDeviceStatus, updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: 'Repair updated successfully'
    });
  } catch (error) {
    console.error('Update repair error:', error);
    return NextResponse.json(
      { error: 'Failed to update repair' },
      { status: 500 }
    );
  }
}
