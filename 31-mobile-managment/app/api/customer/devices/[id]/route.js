import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    if (!customerId || !ObjectId.isValid(customerId) || !ObjectId.isValid(id))
      return NextResponse.json({ error: 'Valid id and customerId required' }, { status: 400 });

    const devices = await getCollection('devices');
    const warranties = await getCollection('warranties');
    const repairs = await getCollection('repairs');

    const cId = new ObjectId(customerId);
    const dId = new ObjectId(id);

    // Verify ownership via ownerId OR customerId
    const device = await devices.findOne({
      _id: dId,
      $or: [{ ownerId: cId }, { customerId: cId }]
    });
    if (!device) return NextResponse.json({ error: 'Device not found or not yours' }, { status: 404 });

    // Warranty
    const warranty = await warranties.findOne({ deviceId: dId });
    let warrantyDaysLeft = null;
    if (warranty?.expiryDate) {
      warrantyDaysLeft = Math.ceil((new Date(warranty.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    }

    // Full repair history with populated service center + technician
    const repairHistory = await repairs.aggregate([
      { $match: { deviceId: dId } },
      { $lookup: { from: 'users', localField: 'servicecenterId', foreignField: '_id', as: 'servicecenter' } },
      { $lookup: { from: 'users', localField: 'technicianId', foreignField: '_id', as: 'technician' } },
      { $unwind: { path: '$servicecenter', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$technician', preserveNullAndEmptyArrays: true } },
      { $project: { 'servicecenter.password': 0, 'technician.password': 0 } },
      { $sort: { createdAt: -1 } },
    ]).toArray();

    // Original sale record
    const sales = await getCollection('sales');
    const sale = await sales.findOne({ deviceId: dId });

    // Resale history
    const resales = await getCollection('resales');
    const resaleHistory = await resales.aggregate([
      { $match: { deviceId: dId } },
      { $lookup: { from: 'users', localField: 'previousOwnerId', foreignField: '_id', as: 'previousOwner' } },
      { $lookup: { from: 'users', localField: 'newOwnerId', foreignField: '_id', as: 'newOwner' } },
      { $unwind: { path: '$previousOwner', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$newOwner', preserveNullAndEmptyArrays: true } },
      { $project: { 'previousOwner.password': 0, 'newOwner.password': 0 } },
      { $sort: { resaleDate: -1 } },
    ]).toArray();

    return NextResponse.json({
      success: true,
      device: { ...device, id: device._id.toString() },
      warranty: warranty ? { ...warranty, id: warranty._id.toString(), warrantyDaysLeft } : null,
      repairHistory: repairHistory.map(r => ({ ...r, id: r._id.toString() })),
      sale: sale ? { ...sale, id: sale._id.toString() } : null,
      resaleHistory,
    });
  } catch (error) {
    console.error('Customer device detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch device details' }, { status: 500 });
  }
}
