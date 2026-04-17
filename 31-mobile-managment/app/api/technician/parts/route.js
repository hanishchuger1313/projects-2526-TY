import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST — technician adds a replaced part
export async function POST(request) {
  try {
    const body = await request.json();
    const { repairId, technicianId, part, serviceCharge } = body;

    if (!repairId || !technicianId) {
      return NextResponse.json({ error: 'repairId and technicianId are required' }, { status: 400 });
    }
    if (!part && !serviceCharge) {
      return NextResponse.json({ error: 'Either part or serviceCharge is required' }, { status: 400 });
    }
    if (!ObjectId.isValid(repairId) || !ObjectId.isValid(technicianId)) {
      return NextResponse.json({ error: 'Invalid repairId or technicianId' }, { status: 400 });
    }

    const repairs = await getCollection('repairs');
    const rId = new ObjectId(repairId);
    const tId = new ObjectId(technicianId);

    const existing = await repairs.findOne({ _id: rId, technicianId: tId });
    if (!existing) return NextResponse.json({ error: 'Repair not found or not assigned to you' }, { status: 404 });
    if (existing.repairStatus === 'delivered') return NextResponse.json({ error: 'Cannot modify a delivered repair' }, { status: 403 });

    const parts = [...(existing.parts || [])];
    const serviceCharges = [...(existing.serviceCharges || [])];

    if (part) {
      if (!part.name || !part.unitPrice) {
        return NextResponse.json({ error: 'Part name and unitPrice are required' }, { status: 400 });
      }
      const qty = parseInt(part.quantity) || 1;
      const price = parseFloat(part.unitPrice) || 0;
      parts.push({
        name: part.name.trim(),
        partNumber: part.partNumber?.trim() || '',
        quantity: qty,
        unitPrice: price,
        totalPrice: parseFloat((qty * price).toFixed(2)),
      });
    }

    if (serviceCharge) {
      if (!serviceCharge.description || !serviceCharge.amount) {
        return NextResponse.json({ error: 'Service charge description and amount are required' }, { status: 400 });
      }
      serviceCharges.push({
        description: serviceCharge.description.trim(),
        amount: parseFloat(serviceCharge.amount) || 0,
      });
    }

    const totalPartsCost = parseFloat(parts.reduce((s, p) => s + (p.totalPrice || 0), 0).toFixed(2));
    const totalServiceCharge = parseFloat(serviceCharges.reduce((s, c) => s + (c.amount || 0), 0).toFixed(2));
    const actualCost = parseFloat((totalPartsCost + totalServiceCharge).toFixed(2));
    const finalBill = existing.warrantyApproved ? 0 : actualCost;

    await repairs.updateOne({ _id: rId }, {
      $set: { parts, serviceCharges, totalPartsCost, totalServiceCharge, actualCost, finalBill, updatedAt: new Date() }
    });

    return NextResponse.json({ success: true, message: part ? 'Part added' : 'Service charge added' });
  } catch (error) {
    console.error('Technician POST parts error:', error);
    return NextResponse.json({ error: 'Failed to update parts/charges' }, { status: 500 });
  }
}

// DELETE — technician removes a part by index
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const repairId = searchParams.get('repairId');
    const technicianId = searchParams.get('technicianId');
    const index = parseInt(searchParams.get('index'));
    const type = searchParams.get('type') || 'part';

    if (!repairId || !technicianId || isNaN(index)) {
      return NextResponse.json({ error: 'repairId, technicianId and index are required' }, { status: 400 });
    }
    if (!ObjectId.isValid(repairId) || !ObjectId.isValid(technicianId)) {
      return NextResponse.json({ error: 'Invalid repairId or technicianId' }, { status: 400 });
    }

    const repairs = await getCollection('repairs');
    const rId = new ObjectId(repairId);
    const tId = new ObjectId(technicianId);

    const existing = await repairs.findOne({ _id: rId, technicianId: tId });
    if (!existing) return NextResponse.json({ error: 'Repair not found or not assigned to you' }, { status: 404 });
    if (existing.repairStatus === 'delivered') return NextResponse.json({ error: 'Cannot modify a delivered repair' }, { status: 403 });

    const parts = [...(existing.parts || [])];
    const serviceCharges = [...(existing.serviceCharges || [])];
    if (type === 'part') {
      if (index < 0 || index >= parts.length) return NextResponse.json({ error: 'Invalid part index' }, { status: 400 });
      parts.splice(index, 1);
    } else if (type === 'charge') {
      if (index < 0 || index >= serviceCharges.length) return NextResponse.json({ error: 'Invalid charge index' }, { status: 400 });
      serviceCharges.splice(index, 1);
    } else {
      return NextResponse.json({ error: 'type must be part or charge' }, { status: 400 });
    }

    const totalPartsCost = parseFloat(parts.reduce((s, p) => s + (p.totalPrice || 0), 0).toFixed(2));
    const totalServiceCharge = parseFloat(serviceCharges.reduce((s, c) => s + (c.amount || 0), 0).toFixed(2));
    const actualCost = parseFloat((totalPartsCost + totalServiceCharge).toFixed(2));
    const finalBill = existing.warrantyApproved ? 0 : actualCost;

    await repairs.updateOne({ _id: rId }, {
      $set: { parts, serviceCharges, totalPartsCost, totalServiceCharge, actualCost, finalBill, updatedAt: new Date() }
    });

    return NextResponse.json({ success: true, message: type === 'part' ? 'Part removed' : 'Service charge removed' });
  } catch (error) {
    console.error('Technician DELETE parts error:', error);
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}
