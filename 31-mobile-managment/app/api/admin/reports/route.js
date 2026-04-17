import { NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getCollection } from '@/lib/mongodb';

// GET - Generate Reports
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // sales, repairs, fraud, warranty
    const format = searchParams.get('format') || 'json'; // json or pdf
    const shopId = searchParams.get('shopId');
    const centerId = searchParams.get('centerId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    let reportData;

    switch (type) {
      case 'sales':
        reportData = await generateSalesReport({ shopId, dateFrom, dateTo });
        break;
      case 'repairs':
        reportData = await generateRepairReport({ centerId, dateFrom, dateTo });
        break;
      case 'fraud':
        reportData = await generateFraudReport();
        break;
      case 'warranty':
        reportData = await generateWarrantyReport();
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    if (format === 'pdf') {
      const pdf = await generatePDFReport(type, reportData);
      return new NextResponse(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${type}-report-${Date.now()}.pdf"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      type,
      data: reportData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function generateSalesReport({ shopId, dateFrom, dateTo }) {
  const sales = await getCollection('sales');
  const users = await getCollection('users');
  const devices = await getCollection('devices');

  const query = {};
  if (shopId) query.shopId = shopId;
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  // Get detailed sales data with shop and device info
  const salesData = await sales.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'users',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shop'
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
    { $unwind: { path: '$shop', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } }
  ]).toArray();

  // Calculate summary statistics
  const summary = await sales.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: '$salePrice' },
        avgSaleValue: { $avg: '$salePrice' },
        minSale: { $min: '$salePrice' },
        maxSale: { $max: '$salePrice' }
      }
    }
  ]).toArray();

  // Sales by shop
  const byShop = await sales.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'users',
        localField: 'shopId',
        foreignField: '_id',
        as: 'shop'
      }
    },
    { $unwind: '$shop' },
    {
      $group: {
        _id: '$shopId',
        shopName: { $first: '$shop.shopName' },
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: '$salePrice' }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]).toArray();

  return {
    sales: salesData,
    summary: summary[0] || { totalSales: 0, totalRevenue: 0, avgSaleValue: 0 },
    byShop
  };
}

async function generateRepairReport({ centerId, dateFrom, dateTo }) {
  const repairs = await getCollection('repairs');

  const query = {};
  if (centerId) query.serviceCenterId = centerId;
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  // Get detailed repair data
  const repairsData = await repairs.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'users',
        localField: 'serviceCenterId',
        foreignField: '_id',
        as: 'center'
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
    {
      $lookup: {
        from: 'devices',
        localField: 'deviceId',
        foreignField: '_id',
        as: 'device'
      }
    },
    { $unwind: { path: '$center', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$technician', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } }
  ]).toArray();

  // Calculate statistics
  const summary = await repairs.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalRepairs: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        totalCost: { $sum: '$actualCost' },
        avgCost: { $avg: '$actualCost' }
      }
    }
  ]).toArray();

  // Repairs by center
  const byCenter = await repairs.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'users',
        localField: 'serviceCenterId',
        foreignField: '_id',
        as: 'center'
      }
    },
    { $unwind: '$center' },
    {
      $group: {
        _id: '$serviceCenterId',
        centerName: { $first: '$center.centerName' },
        totalRepairs: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    },
    { $sort: { totalRepairs: -1 } }
  ]).toArray();

  return {
    repairs: repairsData,
    summary: summary[0] || { totalRepairs: 0, completed: 0, inProgress: 0, pending: 0 },
    byCenter
  };
}

async function generateFraudReport() {
  const devices = await getCollection('devices');

  // Duplicate IMEI attempts
  const duplicateIMEIs = await devices.aggregate([
    {
      $group: {
        _id: '$imei',
        count: { $sum: 1 },
        devices: { $push: '$$ROOT' }
      }
    },
    { $match: { count: { $gt: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();

  // Blacklisted devices
  const blacklisted = await devices.find({ status: 'blacklisted' }).toArray();

  // Suspicious patterns
  const suspiciousPatterns = await devices.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: '$shopId',
        deviceCount: { $sum: 1 },
        devices: { $push: { imei: '$imei', createdAt: '$createdAt' } }
      }
    },
    { $match: { deviceCount: { $gte: 20 } } },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'shop'
      }
    },
    { $unwind: '$shop' }
  ]).toArray();

  return {
    duplicateIMEIs: duplicateIMEIs.map(d => ({
      imei: d._id,
      count: d.count,
      shops: d.devices.map(dev => dev.shopId)
    })),
    blacklisted: blacklisted.map(d => ({
      imei: d.imei,
      reason: d.blacklistReason,
      blacklistedAt: d.blacklistedAt
    })),
    suspiciousPatterns: suspiciousPatterns.map(p => ({
      shopId: p._id,
      shopName: p.shop.shopName,
      deviceCount: p.deviceCount,
      period: 'Last 7 days'
    })),
    summary: {
      totalDuplicates: duplicateIMEIs.length,
      totalBlacklisted: blacklisted.length,
      suspiciousShops: suspiciousPatterns.length,
      riskLevel: duplicateIMEIs.length > 10 ? 'HIGH' : duplicateIMEIs.length > 5 ? 'MEDIUM' : 'LOW'
    }
  };
}

async function generateWarrantyReport() {
  const warranties = await getCollection('warranties');

  // Warranties by status
  const statusDistribution = await warranties.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]).toArray();

  // Expiring soon
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  const expiringSoon = await warranties.find({
    status: 'active',
    expiryDate: { $gte: today, $lte: thirtyDaysLater }
  }).toArray();

  // Expired warranties
  const expired = await warranties.find({
    status: 'expired'
  }).limit(100).toArray();

  // Claimed warranties
  const claimed = await warranties.find({
    status: 'claimed'
  }).toArray();

  return {
    statusDistribution,
    expiringSoon: expiringSoon.map(w => ({
      deviceId: w.deviceId,
      customerId: w.customerId,
      expiryDate: w.expiryDate,
      daysRemaining: Math.ceil((new Date(w.expiryDate) - today) / (1000 * 60 * 60 * 24))
    })),
    expired: expired.length,
    claimed: claimed.length,
    summary: {
      total: await warranties.countDocuments(),
      active: statusDistribution.find(s => s._id === 'active')?.count || 0,
      expiringSoon: expiringSoon.length,
      expired: expired.length,
      claimed: claimed.length
    }
  };
}

async function generatePDFReport(type, data) {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.text(`${type.toUpperCase()} REPORT`, 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  
  // Add content based on type
  let yPos = 40;
  
  if (type === 'sales' && data.summary) {
    doc.setFontSize(14);
    doc.text('Sales Summary', 14, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.text(`Total Sales: ${data.summary.totalSales}`, 14, yPos);
    doc.text(`Total Revenue: $${data.summary.totalRevenue?.toFixed(2) || 0}`, 14, yPos + 7);
    doc.text(`Average Sale: $${data.summary.avgSaleValue?.toFixed(2) || 0}`, 14, yPos + 14);
    
    if (data.byShop && data.byShop.length > 0) {
      yPos += 30;
      doc.autoTable({
        startY: yPos,
        head: [['Shop Name', 'Total Sales', 'Revenue']],
        body: data.byShop.map(shop => [
          shop.shopName || 'Unknown',
          shop.totalSales,
          `$${shop.totalRevenue?.toFixed(2) || 0}`
        ])
      });
    }
  }
  
  if (type === 'fraud' && data.summary) {
    doc.setFontSize(14);
    doc.text('Fraud Detection Summary', 14, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.text(`Duplicate IMEIs: ${data.summary.totalDuplicates}`, 14, yPos);
    doc.text(`Blacklisted Devices: ${data.summary.totalBlacklisted}`, 14, yPos + 7);
    doc.text(`Suspicious Shops: ${data.summary.suspiciousShops}`, 14, yPos + 14);
    doc.text(`Risk Level: ${data.summary.riskLevel}`, 14, yPos + 21);
  }
  
  return doc.output('arraybuffer');
}
