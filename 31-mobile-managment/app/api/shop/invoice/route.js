import { NextResponse } from 'next/server';
import { TransactionModel } from '@/lib/models';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const saleId = searchParams.get('saleId');

    if (!saleId) {
      return NextResponse.json({ success: false, error: 'saleId required' }, { status: 400 });
    }

    // Fetch sale with device, customer, shop details
    const sales = await import('@/lib/mongodb').then(m => m.getCollection('sales'));
    const users = await import('@/lib/mongodb').then(m => m.getCollection('users'));
    const { ObjectId } = await import('mongodb');

    const sale = await sales.aggregate([
      { $match: { _id: new ObjectId(saleId) } },
      { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
      { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customer' } },
      { $lookup: { from: 'users', localField: 'shopId', foreignField: '_id', as: 'shop' } },
      { $lookup: { from: 'warranties', localField: 'deviceId', foreignField: 'deviceId', as: 'warranty' } },
      { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$shop', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$warranty', preserveNullAndEmptyArrays: true } },
    ]).toArray();

    if (!sale || sale.length === 0) {
      return NextResponse.json({ success: false, error: 'Sale not found' }, { status: 404 });
    }

    const s = sale[0];

    // Generate HTML invoice and convert to PDF using browser-compatible approach
    const html = generateInvoiceHTML(s);

    // Return HTML as a printable page instead of PDF (avoids pdfkit/puppeteer deps)
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Invoice GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function generateInvoiceHTML(sale) {
  const saleDate = sale.saleDate ? new Date(sale.saleDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : new Date(sale.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const warrantyExpiry = sale.warranty?.expiryDate
    ? new Date(sale.warranty.expiryDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : 'N/A';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Invoice ${sale.invoiceNumber || sale._id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; color: #1a1a2e; }
    .page { max-width: 800px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
    
    /* Header */
    .header { background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%); color: #fff; padding: 40px 48px 32px; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .brand { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .brand span { opacity: 0.75; font-weight: 400; font-size: 14px; display: block; margin-top: 4px; }
    .invoice-label { text-align: right; }
    .invoice-label h2 { font-size: 32px; font-weight: 700; opacity: 0.95; }
    .invoice-label p { font-size: 13px; opacity: 0.75; margin-top: 4px; }
    .invoice-num { margin-top: 20px; background: rgba(255,255,255,0.15); border-radius: 8px; padding: 10px 16px; display: inline-block; font-size: 14px; letter-spacing: 0.5px; }

    /* Body */
    .body { padding: 40px 48px; }

    /* Info Grid */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 36px; }
    .info-box h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 10px; }
    .info-box p { font-size: 15px; font-weight: 600; color: #111; line-height: 1.6; }
    .info-box span { font-size: 13px; color: #6b7280; font-weight: 400; }

    /* Device Table */
    .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    thead tr { background: #f1f5f9; }
    th { padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; font-weight: 600; }
    td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    .td-main { font-weight: 600; color: #111; }
    .td-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .td-price { font-weight: 700; color: #1d4ed8; font-size: 16px; }

    /* Total */
    .total-row { display: flex; justify-content: flex-end; margin-bottom: 28px; }
    .total-box { background: #f1f5f9; border-radius: 10px; padding: 16px 24px; min-width: 220px; }
    .total-line { display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; margin-bottom: 6px; }
    .total-final { display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: #111; border-top: 2px solid #e2e8f0; padding-top: 10px; margin-top: 6px; }
    .total-final span:last-child { color: #1d4ed8; }

    /* Warranty Badge */
    .warranty-box { background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; padding: 18px 24px; margin-bottom: 28px; display: flex; align-items: center; gap: 16px; }
    .warranty-icon { font-size: 28px; }
    .warranty-text h4 { font-size: 14px; font-weight: 700; color: #1d4ed8; }
    .warranty-text p { font-size: 13px; color: #3b82f6; margin-top: 2px; }

    /* Footer */
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 48px; display: flex; justify-content: space-between; align-items: center; }
    .footer p { font-size: 12px; color: #9ca3af; }
    .footer .status { background: #dcfce7; color: #16a34a; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; }

    /* Print */
    @media print {
      body { background: #fff; }
      .page { box-shadow: none; margin: 0; border-radius: 0; }
      .no-print { display: none !important; }
    }

    .print-btn { display: block; text-align: center; margin: 24px auto 0; }
    .print-btn button { background: linear-gradient(135deg, #1d4ed8, #7c3aed); color: #fff; border: none; padding: 12px 40px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-top">
        <div class="brand">
          📱 MobileManager
          <span>Mobile Phone Management System</span>
        </div>
        <div class="invoice-label">
          <h2>INVOICE</h2>
          <p>Date: ${saleDate}</p>
        </div>
      </div>
      <div class="invoice-num">
        Invoice No: <strong>${sale.invoiceNumber || sale._id?.toString().slice(-12).toUpperCase()}</strong>
      </div>
    </div>

    <!-- Body -->
    <div class="body">
      <!-- Info Grid -->
      <div class="info-grid">
        <div class="info-box">
          <h4>Bill To</h4>
          <p>${sale.customer?.name || sale.customerName || 'N/A'}</p>
          <span>${sale.customer?.phone || sale.customerPhone || ''}</span><br/>
          <span>${sale.customer?.email || sale.customerEmail || ''}</span>
        </div>
        <div class="info-box">
          <h4>Sold By</h4>
          <p>${sale.shop?.shopName || sale.shop?.name || 'Shop'}</p>
          <span>${sale.shop?.address || ''}</span><br/>
          <span>${sale.shop?.phone || ''}</span>
        </div>
      </div>

      <!-- Device Table -->
      <p class="section-title">Device Details</p>
      <table>
        <thead>
          <tr>
            <th>Device</th>
            <th>IMEI</th>
            <th>Storage</th>
            <th>Color</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="td-main">${sale.device?.brand || ''} ${sale.device?.model || ''}</div>
            </td>
            <td><code style="font-size:12px;background:#f1f5f9;padding:2px 6px;border-radius:4px;">${sale.device?.imei || 'N/A'}</code></td>
            <td>${sale.device?.storage || 'N/A'}</td>
            <td>${sale.device?.color || 'N/A'}</td>
            <td class="td-price">$${(sale.salePrice || 0).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <!-- Total -->
      <div class="total-row">
        <div class="total-box">
          <div class="total-line"><span>Subtotal</span><span>$${(sale.salePrice || 0).toLocaleString()}</span></div>
          <div class="total-line"><span>Tax (0%)</span><span>$0.00</span></div>
          <div class="total-final"><span>Total</span><span>$${(sale.salePrice || 0).toLocaleString()}</span></div>
        </div>
      </div>

      <!-- Warranty -->
      <div class="warranty-box">
        <div class="warranty-icon">🛡️</div>
        <div class="warranty-text">
          <h4>Warranty Activated — ${sale.warranty?.warrantyPeriod || sale.device?.warrantyPeriod || 12} Months</h4>
          <p>Valid from ${saleDate} until ${warrantyExpiry}</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for your purchase! Keep this invoice for warranty claims.</p>
      <div class="status">✓ PAID</div>
    </div>
  </div>

  <!-- Print Button -->
  <div class="print-btn no-print">
    <button onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
</body>
</html>`;
}
