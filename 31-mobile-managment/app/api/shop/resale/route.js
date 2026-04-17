import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Initiate resale / ownership transfer
export async function POST(request) {
  try {
    const body = await request.json();
    const { deviceId, newCustomerName, newCustomerPhone, newCustomerEmail, resalePrice, shopId } = body;

    // Validation
    if (!deviceId || !shopId || !resalePrice) {
      return NextResponse.json(
        { error: 'deviceId, shopId and resalePrice are required' },
        { status: 400 }
      );
    }
    if (!newCustomerPhone && !newCustomerEmail) {
      return NextResponse.json(
        { error: 'New customer phone or email is required' },
        { status: 400 }
      );
    }

    const devicesCol   = await getCollection('devices');
    const usersCol     = await getCollection('users');
    const resalesCol   = await getCollection('resales');
    const salesCol     = await getCollection('sales');
    const warrantiesCol = await getCollection('warranties');

    // 1. Verify device belongs to this shop and is sold
    const device = await devicesCol.findOne({
      _id: new ObjectId(deviceId),
      shopId: new ObjectId(shopId)
    });
    if (!device) {
      return NextResponse.json({ error: 'Device not found or not associated with this shop' }, { status: 404 });
    }
    if (device.status !== 'sold' && device.status !== 'resold') {
      return NextResponse.json({ error: 'Only sold devices can be resold' }, { status: 400 });
    }

    // 2. Block if a pending resale already exists
    const pendingResale = await resalesCol.findOne({ deviceId: new ObjectId(deviceId), status: 'pending' });
    if (pendingResale) {
      return NextResponse.json({ error: 'A pending resale already exists for this device' }, { status: 409 });
    }

    // 3. Find or create new customer
    let newCustomer = await usersCol.findOne(
      newCustomerPhone ? { phone: newCustomerPhone } : { email: newCustomerEmail }
    );

    if (!newCustomer) {
      // Register as a minimal customer record (pending profile completion)
      const insertResult = await usersCol.insertOne({
        name: newCustomerName || 'Unknown',
        phone: newCustomerPhone || null,
        email: newCustomerEmail || null,
        role: 'customer',
        status: 'active',
        profileIncomplete: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      newCustomer = { _id: insertResult.insertedId, name: newCustomerName || 'Unknown' };
    }

    const originalCustomerId = device.customerId || device.ownerId;

    // 4. Create resale record
    const resaleDoc = {
      deviceId:           new ObjectId(deviceId),
      originalCustomerId: originalCustomerId ? new ObjectId(originalCustomerId.toString()) : null,
      newCustomerId:      newCustomer._id,
      shopId:             new ObjectId(shopId),
      resalePrice:        parseFloat(resalePrice),
      status:             'pending',
      requestedAt:        new Date(),
      createdAt:          new Date(),
      updatedAt:          new Date()
    };
    const resaleResult = await resalesCol.insertOne(resaleDoc);

    // 5. Complete the transfer immediately (shop-initiated = auto-approved)
    // Update device ownership & history
    await devicesCol.updateOne(
      { _id: new ObjectId(deviceId) },
      {
        $set: {
          customerId:  newCustomer._id,
          ownerId:     newCustomer._id,
          status:      'resold',
          resoldAt:    new Date(),
          updatedAt:   new Date()
        },
        $push: {
          ownershipHistory: {
            fromCustomerId: originalCustomerId || null,
            toCustomerId:   newCustomer._id,
            transferredAt:  new Date(),
            price:          parseFloat(resalePrice),
            via:            'shop-resale'
          }
        }
      }
    );

    // 6. Create new sale record
    const invoiceNumber = `RSL-${Date.now()}`;
    await salesCol.insertOne({
      deviceId:       new ObjectId(deviceId),
      shopId:         new ObjectId(shopId),
      customerId:     newCustomer._id,
      salePrice:      parseFloat(resalePrice),
      invoiceNumber,
      paymentMethod:  'cash',
      isResale:       true,
      previousOwnerId: originalCustomerId || null,
      saleDate:       new Date(),
      createdAt:      new Date(),
      updatedAt:      new Date()
    });

    // 7. Transfer active warranty to new owner (if any)
    await warrantiesCol.updateMany(
      { deviceId: new ObjectId(deviceId), status: 'active' },
      {
        $set: {
          customerId: newCustomer._id,
          updatedAt:  new Date()
        },
        $push: {
          ownershipHistory: {
            fromCustomerId: originalCustomerId || null,
            toCustomerId:   newCustomer._id,
            transferredAt:  new Date()
          }
        }
      }
    );

    // 8. Mark resale as completed
    await resalesCol.updateOne(
      { _id: resaleResult.insertedId },
      { $set: { status: 'completed', completedAt: new Date(), updatedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: 'Device resold and ownership transferred successfully',
      resaleId:      resaleResult.insertedId,
      invoiceNumber,
      newCustomer: {
        id:    newCustomer._id.toString(),
        name:  newCustomer.name,
        phone: newCustomer.phone || newCustomerPhone,
        email: newCustomer.email || newCustomerEmail
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Resale error:', error);
    return NextResponse.json({ error: 'Failed to process resale' }, { status: 500 });
  }
}

// GET - Fetch resale history for a shop
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId  = searchParams.get('shopId');
    const deviceId = searchParams.get('deviceId');

    if (!shopId || !ObjectId.isValid(shopId))
      return NextResponse.json({ error: 'Valid shopId is required' }, { status: 400 });

    const resalesCol = await getCollection('resales');
    const devicesCol = await getCollection('devices');
    const sId = new ObjectId(shopId);

    // Get all deviceIds belonging to this shop
    const shopDevices = await devicesCol.find({ shopId: sId }).project({ _id: 1 }).toArray();
    const shopDeviceIds = shopDevices.map(d => d._id);

    const matchStage = {
      $or: [
        { shopId: sId },
        { deviceId: { $in: shopDeviceIds } }
      ]
    };
    if (deviceId && ObjectId.isValid(deviceId)) matchStage.deviceId = new ObjectId(deviceId);

    const history = await resalesCol.aggregate([
      { $match: matchStage },
      { $lookup: { from: 'devices',  localField: 'deviceId',           foreignField: '_id', as: 'device'           } },
      { $lookup: { from: 'users',    localField: 'originalCustomerId',  foreignField: '_id', as: 'originalCustomer' } },
      { $lookup: { from: 'users',    localField: 'newCustomerId',       foreignField: '_id', as: 'newCustomer'      } },
      { $unwind: { path: '$device',           preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$originalCustomer', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$newCustomer',      preserveNullAndEmptyArrays: true } },
      { $project: { 'originalCustomer.password': 0, 'newCustomer.password': 0, 'originalCustomer.passwordHash': 0, 'newCustomer.passwordHash': 0 } },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    return NextResponse.json({ success: true, resales: history });
  } catch (error) {
    console.error('Resale GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch resale history' }, { status: 500 });
  }
}
