'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import {
  Wrench, Search, Filter, Loader2, Download, Clock,
  CheckCircle, AlertCircle, Package
} from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const STATUS_STYLE = {
  pending: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  'in-progress': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  'waiting-parts': 'bg-orange-500/20 border-orange-500/30 text-orange-400',
  completed: 'bg-green-500/20 border-green-500/30 text-green-400',
  delivered: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
};

const STATUS_TABS = [
  { value: 'all', label: 'All', icon: Filter },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'in-progress', label: 'In Progress', icon: Wrench },
  { value: 'waiting-parts', label: 'Waiting Parts', icon: Package },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function CustomerRepairsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [repairs, setRepairs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') { router.push('/login'); return; }
    const customerId = user.id || user._id;
    if (!customerId) return;
    fetch(`/api/customer/repairs?customerId=${customerId}`)
      .then(r => r.json())
      .then(d => { setRepairs(d.repairs || []); setFiltered(d.repairs || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    let list = [...repairs];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.imei?.toLowerCase().includes(q) ||
        r.jobNumber?.toLowerCase().includes(q) ||
        r.problemDescription?.toLowerCase().includes(q) ||
        r.device?.brand?.toLowerCase().includes(q) ||
        r.device?.model?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') list = list.filter(r => r.repairStatus === statusFilter);
    setFiltered(list);
  }, [search, statusFilter, repairs]);

  const downloadBill = async (repairId) => {
    setDownloadingId(repairId);
    try {
      const res = await fetch(`/api/customer/invoice?type=repair&id=${repairId}&customerId=${user._id}`);
      const { data: repair } = await res.json();
      if (!repair) return;

      const win = window.open('', '_blank');
      win.document.write(`<html><head><title>Repair Bill - ${repair.jobNumber}</title>
        <style>
          body{font-family:Arial,sans-serif;padding:40px;max-width:700px;margin:auto;color:#111}
          h1{font-size:22px}h2{font-size:15px;color:#555;margin-top:20px}
          table{width:100%;border-collapse:collapse;margin-top:8px}
          th,td{border:1px solid #ddd;padding:8px 12px;text-align:left;font-size:13px}
          th{background:#f5f5f5}.total{font-size:18px;font-weight:bold;text-align:right;margin-top:12px}
          .header{display:flex;justify-content:space-between;align-items:flex-start}
          .badge{display:inline-block;padding:3px 10px;border-radius:4px;font-size:12px;background:#e8f5e9;color:#2e7d32}
        </style></head><body>
        <div class="header">
          <div><h1>Repair Invoice</h1><p>Job #: <b>${repair.jobNumber}</b></p></div>
          <div style="text-align:right">
            <p>${repair.closedAt ? new Date(repair.closedAt).toLocaleDateString() : new Date(repair.createdAt).toLocaleDateString()}</p>
            <span class="badge">${repair.repairStatus?.toUpperCase()}</span>
          </div>
        </div><hr/>
        <h2>Service Center</h2>
        <p><b>${repair.servicecenter?.shopName || repair.servicecenter?.name || '—'}</b><br/>${repair.servicecenter?.phone || ''}</p>
        <h2>Device</h2>
        <p>${repair.device?.brand} ${repair.device?.model} &nbsp;|&nbsp; IMEI: <code>${repair.imei}</code></p>
        <h2>Problem</h2><p>${repair.problemDescription}</p>
        ${repair.faultReason ? `<h2>Fault Reason</h2><p>${repair.faultReason}</p>` : ''}
        ${repair.workDone ? `<h2>Work Done</h2><p>${repair.workDone}</p>` : ''}
        <h2>Charges</h2>
        <table>
          <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
          <tbody>
            ${(repair.parts || []).map(p => `<tr><td>${p.name}${p.partNumber ? ` (${p.partNumber})` : ''}</td><td>${p.quantity}</td><td>$${p.unitPrice?.toFixed(2)}</td><td>$${p.totalPrice?.toFixed(2)}</td></tr>`).join('')}
            ${(repair.serviceCharges || []).map(c => `<tr><td>${c.description}</td><td>1</td><td>$${c.amount?.toFixed(2)}</td><td>$${c.amount?.toFixed(2)}</td></tr>`).join('')}
          </tbody>
        </table>
        <p class="total">Total: $${(repair.finalBill || 0).toFixed(2)}</p>
        ${repair.warrantyApproved ? '<p style="color:green">✓ Covered under warranty — No charge</p>' : ''}
        </body></html>`);
      win.document.close();
      win.print();
    } catch (err) { console.error(err); }
    finally { setDownloadingId(null); }
  };

  const COUNTS = Object.fromEntries(
    STATUS_TABS.map(t => [t.value, t.value === 'all' ? repairs.length : repairs.filter(r => r.repairStatus === t.value).length])
  );

  if (loading) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="customer" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Repair History" breadcrumbs={['Customer', 'Repairs']} />
        <div className="flex-1 overflow-auto p-6 space-y-5">

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map(tab => {
              const Icon = tab.icon;
              const active = statusFilter === tab.value;
              return (
                <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all
                    ${active ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'}`}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded text-xs ${active ? 'bg-blue-500' : 'bg-white/10'}`}>
                    {COUNTS[tab.value]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by device, IMEI, job number, or issue..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Repair Cards */}
          {filtered.length === 0 ? (
            <div className="glass rounded-xl p-10 border border-white/10 text-center">
              <Wrench className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-white font-semibold">{search ? 'No matching repairs' : 'No repairs found'}</p>
              <p className="text-gray-400 text-sm mt-1">
                {search ? 'Try a different search term' : 'Your repair history will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r, i) => (
                <motion.div key={r._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="glass rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-semibold">{r.device?.brand} {r.device?.model}</p>
                        <span className="text-gray-500 text-xs font-mono">{r.imei}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{r.problemDescription}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border shrink-0 ${STATUS_STYLE[r.repairStatus] || ''}`}>
                      {r.repairStatus?.replace(/-/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-400 mb-3">
                    <div><span className="text-gray-600">Job #</span><br /><span className="text-white font-mono">{r.jobNumber}</span></div>
                    <div><span className="text-gray-600">Service Center</span><br /><span className="text-white">{r.servicecenter?.shopName || r.servicecenter?.name || '—'}</span></div>
                    <div><span className="text-gray-600">Technician</span><br /><span className="text-white">{r.technician?.name || '—'}</span></div>
                    <div><span className="text-gray-600">Date</span><br /><span className="text-white">{new Date(r.createdAt).toLocaleDateString()}</span></div>
                  </div>

                  {(r.faultReason || r.workDone) && (
                    <div className="bg-white/5 rounded-lg p-3 text-xs space-y-1 mb-3">
                      {r.faultReason && <p className="text-gray-400"><span className="text-gray-500">Fault:</span> {r.faultReason}</p>}
                      {r.workDone && <p className="text-gray-400"><span className="text-gray-500">Work done:</span> {r.workDone}</p>}
                    </div>
                  )}

                  {r.parts?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-gray-500 text-xs mb-1">Parts replaced:</p>
                      <div className="flex flex-wrap gap-1">
                        {r.parts.map((p, pi) => (
                          <span key={pi} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-gray-300">{p.name}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                      {r.warrantyApproved
                        ? <span className="text-purple-400 text-sm font-medium">✓ Warranty covered</span>
                        : <span className="text-green-400 text-sm font-semibold">
                            {r.finalBill > 0 ? `$${r.finalBill?.toFixed(2)}` : 'Pending'}
                          </span>
                      }
                    </div>
                    {r.repairStatus === 'delivered' && (
                      <button onClick={() => downloadBill(r._id)} disabled={downloadingId === r._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs hover:bg-blue-600/30 transition-all">
                        {downloadingId === r._id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Download className="w-3.5 h-3.5" />}
                        Download Bill
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
