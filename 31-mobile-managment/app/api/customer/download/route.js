import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

function buildInvoiceHTML(device, customer, warranty) {
  const warrantyDays = warranty
    ? Math.max(0, Math.round((new Date(warranty.expiryDate) - new Date()) / 86400000))
    : null;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice</title>
  <style>
    body{font-family:Arial,sans-serif;margin:40px;color:#222;background:#fff}
    h1{color:#1a56db;margin-bottom:4px}
    .meta{color:#666;font-size:13px;margin-bottom:24px}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th{background:#f3f4f6;text-align:left;padding:10px 12px;font-size:13px;color:#374151}
    td{padding:10px 12px;font-size:13px;border-bottom:1px solid #e5e7eb}
    .badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600}
    .green{background:#d1fae5;color:#065f46}
    .red{background:#fee2e2;color:#991b1b}
    .amber{background:#fef3c7;color:#92400e}
    .footer{margin-top:40px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:16px}
  </style></head><body>
  <h1>Device Purchase Invoice</h1>
  <div class="meta">Generated: ${new Date().toLocaleDateString()} &nbsp;|&nbsp; ${new Date().toLocaleTimeString()}</div>
  <table>
    <tr><th colspan="2">Device Information</th></tr>
    <tr><td>Brand / Model</td><td><strong>${device.brand} ${device.model}</strong></td></tr>
    <tr><td>IMEI</td><td><code>${device.imei}</code></td></tr>
    <tr><td>Serial Number</td><td>${device.serialNumber || '—'}</td></tr>
    <tr><td>Color</td><td>${device.color || '—'}</td></tr>
    <tr><td>Storage</td><td>${device.storage || '—'}</td></tr>
    <tr><td>RAM</td><td>${device.ram || '—'}</td></tr>
    <tr><td>Purchase Date</td><td>${device.purchaseDate ? new Date(device.purchaseDate).toLocaleDateString() : '—'}</td></tr>
    <tr><td>Purchase Price</td><td><strong>$${(device.purchasePrice || 0).toFixed(2)}</strong></td></tr>
    <tr><th colspan="2">Owner</th></tr>
    <tr><td>Name</td><td>${customer?.name || '—'}</td></tr>
    <tr><td>Email</td><td>${customer?.email || '—'}</td></tr>
    <tr><td>Phone</td><td>${customer?.phone || '—'}</td></tr>
    ${warranty ? `
    <tr><th colspan="2">Warranty</th></tr>
    <tr><td>Provider</td><td>${warranty.provider || '—'}</td></tr>
    <tr><td>Type</td><td>${warranty.warrantyType || 'standard'}</td></tr>
    <tr><td>Start Date</td><td>${new Date(warranty.startDate).toLocaleDateString()}</td></tr>
    <tr><td>Expiry Date</td><td>${new Date(warranty.expiryDate).toLocaleDateString()}</td></tr>
    <tr><td>Status</td><td>
      <span class="badge ${warrantyDays > 0 ? 'green' : 'red'}">${warrantyDays > 0 ? `Active (${warrantyDays} days left)` : 'Expired'}</span>
    </td></tr>` : '<tr><td colspan="2">No warranty registered</td></tr>'}
  </table>
  <div class="footer">This is a system-generated document. &copy; ${new Date().getFullYear()} Mobile Management System</div>
  </body></html>`;
}

function buildRepairBillHTML(repair, device, servicecenter) {
  const partsRows = (repair.parts || []).map(p =>
    `<tr><td>${p.name}</td><td>${p.partNumber || '—'}</td><td>${p.quantity}</td><td>$${(p.unitPrice || 0).toFixed(2)}</td><td>$${(p.totalPrice || 0).toFixed(2)}</td></tr>`
  ).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Repair Bill</title>
  <style>
    body{font-family:Arial,sans-serif;margin:40px;color:#222}
    h1{color:#1a56db;margin-bottom:4px}
    .meta{color:#666;font-size:13px;margin-bottom:24px}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th{background:#f3f4f6;text-align:left;padding:10px 12px;font-size:13px;color:#374151}
    td{padding:10px 12px;font-size:13px;border-bottom:1px solid #e5e7eb}
    .total{font-size:16px;font-weight:bold;color:#065f46}
    .section{margin-top:24px}
    .footer{margin-top:40px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:16px}
    .badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;background:#d1fae5;color:#065f46}
  </style></head><body>
  <h1>Repair Bill</h1>
  <div class="meta">Job #: <strong>${repair.jobNumber}</strong> &nbsp;|&nbsp; Date: ${repair.closedAt ? new Date(repair.closedAt).toLocaleDateString() : new Date().toLocaleDateString()}</div>
  <table>
    <tr><th colspan="2">Device</th></tr>
    <tr><td>Device</td><td><strong>${device?.brand} ${device?.model}</strong></td></tr>
    <tr><td>IMEI</td><td><code>${repair.imei}</code></td></tr>
    <tr><th colspan="2">Service Center</th></tr>
    <tr><td>Name</td><td>${servicecenter?.shopName || servicecenter?.name || '—'}</td></tr>
    <tr><td>Phone</td><td>${servicecenter?.phone || '—'}</td></tr>
    <tr><th colspan="2">Issue</th></tr>
    <tr><td colspan="2">${repair.problemDescription}</td></tr>
    ${repair.faultReason ? `<tr><td>Fault Reason</td><td>${repair.faultReason}</td></tr>` : ''}
    ${repair.workDone ? `<tr><td>Work Done</td><td>${repair.workDone}</td></tr>` : ''}
  </table>

  ${repair.parts?.length > 0 ? `
  <div class="section">
  <table>
    <tr><th>Part</th><th>Part #</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
    ${partsRows}
  </table></div>` : ''}

  <div class="section">
  <table>
    <tr><td>Parts Total</td><td>$${(repair.totalPartsCost || 0).toFixed(2)}</td></tr>
    <tr><td>Service Charges</td><td>$${(repair.totalServiceCharge || 0).toFixed(2)}</td></tr>
    ${repair.warrantyApproved ? `<tr><td>Warranty Discount</td><td style="color:#dc2626">-$${(repair.actualCost || 0).toFixed(2)}</td></tr>` : ''}
    <tr><td class="total">TOTAL</td><td class="total">$${(repair.finalBill || 0).toFixed(2)}</td></tr>
    ${repair.paymentMethod ? `<tr><td>Payment Method</td><td style="text-transform:capitalize">${repair.paymentMethod}</td></tr>` : ''}
  </table></div>
  <div class="footer">This is a system-generated document. &copy; ${new Date().getFullYear()} Mobile Management System</div>
  </body></html>`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const customerId = searchParams.get('customerId');
    if (!customerId) return NextResponse.json({ error: 'customerId required' }, { status: 400 });

    const cId = new ObjectId(customerId);
    let html = '';
    let filename = 'document.html';

    if (type === 'invoice') {
      const deviceId = searchParams.get('deviceId');
      if (!deviceId) return NextResponse.json({ error: 'deviceId required' }, { status: 400 });

      const devicesCol = await getCollection('devices');
      const usersCol = await getCollection('users');
      const warrantiesCol = await getCollection('warranties');

      const device = await devicesCol.findOne({ _id: new ObjectId(deviceId), currentOwnerId: cId });
      if (!device) return NextResponse.json({ error: 'Device not found' }, { status: 404 });

      const customer = await usersCol.findOne({ _id: cId });
      const warranty = await warrantiesCol.findOne({ deviceId: device._id });

      html = buildInvoiceHTML(device, customer, warranty);
      filename = `invoice-${device.imei}.html`;

    } else if (type === 'repair-bill') {
      const repairId = searchParams.get('repairId');
      if (!repairId) return NextResponse.json({ error: 'repairId required' }, { status: 400 });

      const repairsCol = await getCollection('repairs');
      const devicesCol = await getCollection('devices');
      const usersCol = await getCollection('users');

      const repair = await repairsCol.findOne({ _id: new ObjectId(repairId), customerId: cId });
      if (!repair) return NextResponse.json({ error: 'Repair not found' }, { status: 404 });

      const device = repair.deviceId ? await devicesCol.findOne({ _id: repair.deviceId }) : null;
      const servicecenter = repair.servicecenterId ? await usersCol.findOne({ _id: repair.servicecenterId }) : null;

      html = buildRepairBillHTML(repair, device, servicecenter);
      filename = `repair-bill-${repair.jobNumber}.html`;

    } else {
      return NextResponse.json({ error: 'Invalid type. Use invoice or repair-bill' }, { status: 400 });
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Customer download error:', error);
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
  }
}
