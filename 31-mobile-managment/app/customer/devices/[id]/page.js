'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import {
  ArrowLeft, Loader2, Smartphone, Shield, Wrench, Store,
  CheckCircle, AlertCircle, Clock, ArrowLeftRight, Download,
  ChevronDown, ChevronUp, FileText
} from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';

const WARRANTY_COLOR = (days) => {
  if (days == null) return { label: 'No Warranty', cls: 'bg-gray-500/10 border-gray-500/20 text-gray-400' };
  if (days <= 0) return { label: 'Expired', cls: 'bg-red-500/10 border-red-500/20 text-red-400' };
  if (days <= 30) return { label: `${days} days left`, cls: 'bg-orange-500/10 border-orange-500/20 text-orange-400' };
  if (days <= 90) return { label: `${days} days left`, cls: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
  return { label: `${days} days left`, cls: 'bg-green-500/10 border-green-500/20 text-green-400' };
};

const STATUS_STYLE = {
  pending: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  'in-progress': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  'waiting-parts': 'bg-orange-500/20 border-orange-500/30 text-orange-400',
  completed: 'bg-green-500/20 border-green-500/30 text-green-400',
  delivered: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
};

export default function CustomerDeviceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [repairsOpen, setRepairsOpen] = useState(true);
  const [ownershipOpen, setOwnershipOpen] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') { router.push('/login'); return; }
    const customerId = user.id || user._id;
    if (!customerId) return;
    fetch(`/api/customer/devices/${params.id}?customerId=${customerId}`)
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.error);
        setData(d);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, router, params.id]);

  const downloadRepairBill = async (repairId) => {
    setDownloadingId(repairId);
    try {
      const res = await fetch(`/api/customer/invoice?type=repair&id=${repairId}&customerId=${user._id}`);
      const { data: repair } = await res.json();
      printInvoice(repair);
    } catch (err) { console.error(err); }
    finally { setDownloadingId(null); }
  };

  const printInvoice = (repair) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Repair Bill - ${repair.jobNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #111; max-width: 700px; margin: auto; }
        h1 { font-size: 22px; } h2 { font-size: 16px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
        th { background: #f5f5f5; }
        .total { font-size: 18px; font-weight: bold; }
        .header { display: flex; justify-content: space-between; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 12px; background: #e8f5e9; color: #2e7d32; }
      </style></head><body>
      <div class="header">
        <div><h1>Repair Invoice</h1><p>Job #: <b>${repair.jobNumber}</b></p></div>
        <div style="text-align:right">
          <p>Date: ${repair.closedAt ? new Date(repair.closedAt).toLocaleDateString() : new Date(repair.createdAt).toLocaleDateString()}</p>
          <span class="badge">${repair.repairStatus?.toUpperCase()}</span>
        </div>
      </div>
      <hr/>
      <h2>Service Center</h2>
      <p>${repair.servicecenter?.shopName || repair.servicecenter?.name || '—'}<br/>
         ${repair.servicecenter?.phone || ''}</p>
      <h2>Device</h2>
      <p>${repair.device?.brand} ${repair.device?.model} &nbsp;|&nbsp; IMEI: ${repair.imei}</p>
      <h2>Problem</h2><p>${repair.problemDescription}</p>
      ${repair.faultReason ? `<h2>Fault Reason</h2><p>${repair.faultReason}</p>` : ''}
      ${repair.workDone ? `<h2>Work Done</h2><p>${repair.workDone}</p>` : ''}
      <table>
        <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
        <tbody>
          ${(repair.parts || []).map(p => `<tr><td>${p.name}</td><td>${p.quantity}</td><td>$${p.unitPrice?.toFixed(2)}</td><td>$${p.totalPrice?.toFixed(2)}</td></tr>`).join('')}
          ${(repair.serviceCharges || []).map(c => `<tr><td>${c.description}</td><td>1</td><td>$${c.amount?.toFixed(2)}</td><td>$${c.amount?.toFixed(2)}</td></tr>`).join('')}
        </tbody>
      </table>
      <p class="total" style="margin-top:16px; text-align:right;">Total: $${(repair.finalBill || 0).toFixed(2)}</p>
      ${repair.warrantyApproved ? '<p style="color:green">✓ Covered under warranty</p>' : ''}
      </body></html>`);
    win.document.close();
    win.print();
  };

  if (loading) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  if (error || !data) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <p className="text-white text-xl mb-4">{error || 'Device not found'}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Go Back</button>
      </div>
    </div>
  );

  const { device, repairHistory = [], resaleHistory = [], sale, warranty } = data;
  const ownershipHistory = resaleHistory;
  const shop = sale?.shop || sale?.servicecenter || null;
  const wt = WARRANTY_COLOR(warranty?.warrantyDaysLeft ?? device?.warrantyDaysLeft);

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="customer" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Device Details" breadcrumbs={['Customer', 'Devices', `${device.brand} ${device.model}`]} />
        <div className="flex-1 overflow-auto p-6 space-y-5">

          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" /> Back to Devices
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left */}
            <div className="lg:col-span-2 space-y-5">

              {/* Device Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6 border border-white/10">
                <div className="flex items-start gap-4 mb-5">
                  <div className="bg-blue-500/10 p-4 rounded-xl">
                    <Smartphone className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">{device.brand} {device.model}</h2>
                    <p className="text-gray-400 font-mono text-sm mt-0.5">IMEI: {device.imei}</p>
                    {device.serialNumber && <p className="text-gray-500 text-xs mt-0.5">S/N: {device.serialNumber}</p>}
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${wt.cls}`}>
                    {wt.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  {[
                    { label: 'Color', value: device.color },
                    { label: 'Storage', value: device.storage },
                    { label: 'RAM', value: device.ram },
                    { label: 'Purchase Date', value: device.purchaseDate ? new Date(device.purchaseDate).toLocaleDateString() : null },
                    { label: 'Status', value: device.status?.toUpperCase() },
                    { label: 'Total Repairs', value: repairHistory.length },
                  ].filter(i => i.value).map((item, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-0.5">{item.label}</p>
                      <p className="text-white font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Warranty Detail */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="glass rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" /> Warranty Status
                </h3>
                {device.warranty ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold ${wt.cls}`}>
                        {device.warrantyDaysLeft > 0
                          ? <CheckCircle className="w-4 h-4" />
                          : <AlertCircle className="w-4 h-4" />}
                        {wt.label}
                      </div>
                    </div>
                    {/* Countdown bar */}
                    {device.warranty.expiryDate && device.warrantyDaysLeft > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Warranty Period</span>
                          <span>{device.warrantyDaysLeft} days remaining</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${device.warrantyDaysLeft <= 30 ? 'bg-orange-500' : device.warrantyDaysLeft <= 90 ? 'bg-amber-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(100, (device.warrantyDaysLeft / 365) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-0.5">Expires</p>
                        <p className="text-white">{new Date(device.warranty.expiryDate).toLocaleDateString()}</p>
                      </div>
                      {device.warranty.type && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-gray-400 text-xs mb-0.5">Type</p>
                          <p className="text-white capitalize">{device.warranty.type}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No warranty on record</p>
                )}
              </motion.div>

              {/* Repair History */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass rounded-xl border border-white/10 overflow-hidden">
                <button onClick={() => setRepairsOpen(!repairsOpen)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-orange-400" /> Repair History
                    <span className="px-2 py-0.5 text-xs bg-white/10 rounded text-gray-300">{repairHistory.length}</span>
                  </h3>
                  {repairsOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {repairsOpen && (
                  <div className="p-5 pt-0 space-y-3">
                    {repairHistory.length === 0 ? (
                      <p className="text-gray-500 text-sm">No repairs on record</p>
                    ) : repairHistory.map((r) => (
                      <div key={r._id} className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white text-sm font-semibold">{r.problemDescription}</p>
                            <p className="text-gray-400 text-xs mt-0.5">
                              {r.servicecenter?.shopName || r.servicecenter?.name || 'Unknown'} ·
                              Job #{r.jobNumber} · {new Date(r.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border shrink-0 ml-2 ${STATUS_STYLE[r.repairStatus] || ''}`}>
                            {r.repairStatus?.replace(/-/g, ' ').toUpperCase()}
                          </span>
                        </div>
                        {r.faultReason && <p className="text-gray-400 text-xs">Fault: {r.faultReason}</p>}
                        {r.workDone && <p className="text-gray-400 text-xs">Work: {r.workDone}</p>}
                        {r.parts?.length > 0 && (
                          <p className="text-gray-500 text-xs mt-1">Parts: {r.parts.map(p => p.name).join(', ')}</p>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                          {r.warrantyApproved
                            ? <span className="text-purple-400 text-xs">Warranty covered</span>
                            : <span className="text-green-400 text-sm font-semibold">${(r.finalBill || 0).toFixed(2)}</span>
                          }
                          {r.repairStatus === 'delivered' && (
                            <button onClick={() => downloadRepairBill(r._id)}
                              disabled={downloadingId === r._id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs hover:bg-blue-600/30 transition-all">
                              {downloadingId === r._id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Download className="w-3.5 h-3.5" />}
                              Download Bill
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Ownership History */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="glass rounded-xl border border-white/10 overflow-hidden">
                <button onClick={() => setOwnershipOpen(!ownershipOpen)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-purple-400" /> Ownership History
                    <span className="px-2 py-0.5 text-xs bg-white/10 rounded text-gray-300">{ownershipHistory.length}</span>
                  </h3>
                  {ownershipOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {ownershipOpen && (
                  <div className="p-5 pt-0 space-y-3">
                    {ownershipHistory.length === 0 ? (
                      <p className="text-gray-500 text-sm">No transfer history</p>
                    ) : ownershipHistory.map((t) => (
                      <div key={t._id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3 text-sm">
                        <div className="flex-1">
                          <p className="text-white">
                            <span className="text-gray-400">From:</span> {t.from?.name || '—'} →
                            <span className="text-gray-400"> To:</span> {t.to?.name || '—'}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border
                          ${t.status === 'completed' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                            t.status === 'rejected' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                            'bg-amber-500/20 border-amber-500/30 text-amber-400'}`}>
                          {t.status?.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

            </div>

            {/* Right */}
            <div className="space-y-5">
              {/* Shop Info */}
              {shop && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                  className="glass rounded-xl p-5 border border-white/10">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Store className="w-4 h-4 text-purple-400" /> Purchased From
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-white font-medium">{shop.shopName || shop.name}</p>
                    {shop.phone && <p className="text-gray-400">{shop.phone}</p>}
                    {shop.address && <p className="text-gray-400 text-xs">{shop.address}</p>}
                  </div>
                </motion.div>
              )}

              {/* Download Purchase Invoice */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> Documents
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={async () => {
                      const customerId = user.id || user._id;
                      const res = await fetch(`/api/customer/invoice?type=purchase&id=${device._id}&customerId=${customerId}`);
                      const json = await res.json();
                      if (!json.success) return;
                      const { device: d, sale } = json.data;
                      const win = window.open('', '_blank');
                      win.document.write(`<html><head><title>Purchase Invoice</title>
                        <style>body{font-family:Arial,sans-serif;padding:40px;max-width:700px;margin:auto}h1{font-size:22px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left}th{background:#f5f5f5}</style>
                        </head><body>
                        <h1>Purchase Invoice</h1>
                        <p>Date: ${d.purchaseDate ? new Date(d.purchaseDate).toLocaleDateString() : '—'}</p>
                        <h2>Device</h2>
                        <table><tr><th>Brand</th><td>${d.brand}</td></tr><tr><th>Model</th><td>${d.model}</td></tr>
                        <tr><th>IMEI</th><td>${d.imei}</td></tr><tr><th>Color</th><td>${d.color || '—'}</td></tr>
                        <tr><th>Storage</th><td>${d.storage || '—'}</td></tr></table>
                        ${sale ? `<p style="margin-top:20px;font-size:18px;font-weight:bold">Sale Price: $${sale.salePrice?.toFixed(2) || '—'}</p>` : ''}
                        </body></html>`);
                      win.document.close();
                      win.print();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-600/20 transition-all">
                    <Download className="w-4 h-4" /> Purchase Invoice
                  </button>
                </div>
              </motion.div>

             
              
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
