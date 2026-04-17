import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { isValidImei, normalizeImei } from '@/lib/imei';

// GET - Search device by IMEI
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imei = normalizeImei(searchParams.get('imei') || '');

    if (!imei) {
      return NextResponse.json(
        { error: 'IMEI is required' },
        { status: 400 }
      );
    }

    if (!isValidImei(imei)) {
      return NextResponse.json(
        { error: 'IMEI must be exactly 15 digits' },
        { status: 400 }
      );
    }

    const devices = await getCollection('devices');
    const device = await devices.findOne({ imei });

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found in the system' },
        { status: 404 }
      );
    }

    // Get customer details
    const users = await getCollection('users');
    let customer = null;
    if (device.customerId) {
      customer = await users.findOne({ _id: device.customerId });
    }

    // Get shop details
    let shop = null;
    if (device.shopId) {
      shop = await users.findOne({ _id: device.shopId });
    }

    // Get warranty details
    const warranties = await getCollection('warranties');
    const warranty = await warranties.findOne({
      deviceId: device._id,
      status: 'active'
    });

    // Get repair history
    const repairs = await getCollection('repairs');
    const repairHistory = await repairs.aggregate([
      { $match: { deviceId: device._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'servicecenterId',
          foreignField: '_id',
          as: 'servicecenter'
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
      { $unwind: { path: '$servicecenter', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$technician', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    // Check warranty status
    let warrantyStatus = 'No Warranty';
    let warrantyValid = false;
    if (warranty) {
      const now = new Date();
      const expiryDate = new Date(warranty.expiryDate);
      if (expiryDate > now) {
        warrantyStatus = 'Active';
        warrantyValid = true;
      } else {
        warrantyStatus = 'Expired';
      }
    }

    return NextResponse.json({
      success: true,
      device: {
        ...device,
        id: device._id.toString()
      },
      customer: customer ? {
        id: customer._id.toString(),
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      } : null,
      shop: shop ? {
        id: shop._id.toString(),
        name: shop.shopName || shop.name,
        address: shop.address,
        phone: shop.phone
      } : null,
      warranty: warranty ? {
        ...warranty,
        id: warranty._id.toString(),
        status: warrantyStatus,
        valid: warrantyValid,
        daysRemaining: warrantyValid 
          ? Math.ceil((new Date(warranty.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
          : 0
      } : null,
      repairHistory: repairHistory.map(r => ({
        ...r,
        id: r._id.toString()
      }))
    });
  } catch (error) {
    console.error('Search device error:', error);
    return NextResponse.json(
      { error: 'Failed to search device' },
      { status: 500 }
    );
  }
}
