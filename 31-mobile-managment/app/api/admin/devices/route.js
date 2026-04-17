import { NextResponse } from 'next/server';
import { DeviceModel } from '@/lib/models';
import { isValidImei, normalizeImei } from '@/lib/imei';
import { ObjectId } from 'mongodb';

// GET - Fetch all devices with IMEI monitoring
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const shopId = searchParams.get('shopId');
    const search = searchParams.get('search'); // Search by IMEI

    const filters = {};
    if (status) filters.status = status;
    if (shopId) filters.shopId = shopId;
    if (search) filters.imei = { $regex: search, $options: 'i' };

    const devices = await DeviceModel.findAll(filters);

    // Convert MongoDB _id to id
    const devicesFormatted = devices.map(({ _id, ...device }) => ({
      ...device,
      id: _id.toString()
    }));

    return NextResponse.json({ 
      devices: devicesFormatted,
      total: devicesFormatted.length 
    });
  } catch (error) {
    console.error('Fetch devices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

// POST - Add device to blacklist
export async function POST(request) {
  try {
    const body = await request.json();
    const { imei, reason } = body;
    const normalizedImei = normalizeImei(imei);

    if (!normalizedImei) {
      return NextResponse.json(
        { error: 'IMEI is required' },
        { status: 400 }
      );
    }

    if (!isValidImei(normalizedImei)) {
      return NextResponse.json(
        { error: 'IMEI must be exactly 15 digits' },
        { status: 400 }
      );
    }

    // Find device by IMEI
    const device = await DeviceModel.findByImei(normalizedImei);

    if (!device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    // Update device to blacklisted
    const updatedDevice = await DeviceModel.update(device._id.toString(), {
      status: 'blacklisted',
      blacklistReason: reason || 'Suspicious activity detected',
      blacklistedAt: new Date()
    });

    return NextResponse.json({
      message: 'Device blacklisted successfully',
      device: updatedDevice
    });
  } catch (error) {
    console.error('Blacklist device error:', error);
    return NextResponse.json(
      { error: 'Failed to blacklist device' },
      { status: 500 }
    );
  }
}

// PATCH - Remove from blacklist
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    const updatedDevice = await DeviceModel.update(deviceId, {
      status: 'in-stock',
      blacklistReason: null,
      blacklistedAt: null,
      whitelistedAt: new Date()
    });

    return NextResponse.json({
      message: 'Device removed from blacklist',
      device: updatedDevice
    });
  } catch (error) {
    console.error('Remove blacklist error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from blacklist' },
      { status: 500 }
    );
  }
}
