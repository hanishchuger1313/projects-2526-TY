import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Add parts and service charges
export async function POST(request) {
  try {
    const body = await request.json();
    const { repairId, parts, serviceCharges } = body;

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
      return NextResponse.json({ error: 'Cannot modify parts of a delivered repair' }, { status: 403 });
    }

    const updateData = {};

    // Add parts
    if (parts && parts.length > 0) {
      const newParts = parts.map(part => ({
        name: part.name,
        partNumber: part.partNumber || '',
        quantity: parseInt(part.quantity) || 1,
        unitPrice: parseFloat(part.unitPrice) || 0,
        totalPrice: (parseInt(part.quantity) || 1) * (parseFloat(part.unitPrice) || 0),
        addedAt: new Date()
      }));

      updateData.$push = { parts: { $each: newParts } };
    }

    // Add service charges
    if (serviceCharges && serviceCharges.length > 0) {
      const newCharges = serviceCharges.map(charge => ({
        description: charge.description,
        amount: parseFloat(charge.amount) || 0,
        addedAt: new Date()
      }));

      if (updateData.$push) {
        updateData.$push.serviceCharges = { $each: newCharges };
      } else {
        updateData.$push = { serviceCharges: { $each: newCharges } };
      }
    }

    // Update repair with new parts/charges
    if (!updateData.$push) {
      return NextResponse.json({ error: 'No parts or service charges supplied' }, { status: 400 });
    }

    await repairs.updateOne(
      { _id: new ObjectId(repairId) },
      updateData
    );

    // Recalculate totals
    const updatedRepair = await repairs.findOne({ _id: new ObjectId(repairId) });
    
    const totalPartsCost = (updatedRepair.parts || []).reduce(
      (sum, part) => sum + (part.totalPrice || 0), 
      0
    );
    
    const totalServiceCharge = (updatedRepair.serviceCharges || []).reduce(
      (sum, charge) => sum + (charge.amount || 0), 
      0
    );

    const finalBill = updatedRepair.warrantyApproved ? 0 : (totalPartsCost + totalServiceCharge);

    // Update totals
    await repairs.updateOne(
      { _id: new ObjectId(repairId) },
      {
        $set: {
          totalPartsCost,
          totalServiceCharge,
          actualCost: totalPartsCost + totalServiceCharge,
          finalBill,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Parts and charges added successfully',
      totals: {
        totalPartsCost,
        totalServiceCharge,
        finalBill
      }
    });
  } catch (error) {
    console.error('Add parts/charges error:', error);
    return NextResponse.json(
      { error: 'Failed to add parts/charges' },
      { status: 500 }
    );
  }
}

// DELETE - Remove part or service charge
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const repairId = searchParams.get('repairId');
    const type = searchParams.get('type'); // 'part' or 'charge'
    const index = searchParams.get('index');

    if (!repairId || !type || index === null) {
      return NextResponse.json(
        { error: 'Repair ID, type, and index are required' },
        { status: 400 }
      );
    }

    const repairs = await getCollection('repairs');
    const repair = await repairs.findOne({ _id: new ObjectId(repairId) });

    if (!repair) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 });
    }

    if (repair.repairStatus === 'delivered') {
      return NextResponse.json({ error: 'Cannot modify parts of a delivered repair' }, { status: 403 });
    }

    const idx = parseInt(index);
    if (Number.isNaN(idx) || idx < 0) {
      return NextResponse.json({ error: 'Invalid item index' }, { status: 400 });
    }

    if (type === 'part') {
      if (!Array.isArray(repair.parts) || idx >= repair.parts.length) {
        return NextResponse.json({ error: 'Part not found at provided index' }, { status: 404 });
      }
      repair.parts.splice(idx, 1);
      await repairs.updateOne(
        { _id: new ObjectId(repairId) },
        { $set: { parts: repair.parts } }
      );
    } else if (type === 'charge') {
      if (!Array.isArray(repair.serviceCharges) || idx >= repair.serviceCharges.length) {
        return NextResponse.json({ error: 'Service charge not found at provided index' }, { status: 404 });
      }
      repair.serviceCharges.splice(idx, 1);
      await repairs.updateOne(
        { _id: new ObjectId(repairId) },
        { $set: { serviceCharges: repair.serviceCharges } }
      );
    } else {
      return NextResponse.json({ error: 'type must be part or charge' }, { status: 400 });
    }

    // Recalculate totals
    const totalPartsCost = (repair.parts || []).reduce(
      (sum, part) => sum + (part.totalPrice || 0), 
      0
    );
    
    const totalServiceCharge = (repair.serviceCharges || []).reduce(
      (sum, charge) => sum + (charge.amount || 0), 
      0
    );

    const finalBill = repair.warrantyApproved ? 0 : (totalPartsCost + totalServiceCharge);

    await repairs.updateOne(
      { _id: new ObjectId(repairId) },
      {
        $set: {
          totalPartsCost,
          totalServiceCharge,
          actualCost: totalPartsCost + totalServiceCharge,
          finalBill,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: `${type} removed successfully`
    });
  } catch (error) {
    console.error('Remove part/charge error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item' },
      { status: 500 }
    );
  }
}
