'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import {
  ArrowLeft, Loader2, AlertCircle, CheckCircle, Download,
  Wrench, Package, Clock, Shield, Store, User, FileText
} from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';

const STATUS_STYLE = {
  pending: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  'in-progress': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  'waiting-parts': 'bg-orange-500/20 border-orange-500/30 text-orange-400',
  completed: 'bg-green-500/20 border-green-500/30 text-green-400',
  delivered: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
};

const STATUS_FLOW = [
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'in-progress', label: 'In Progress', icon: Wrench },
  { value: 'waiting-parts', label: 'Waiting Parts', icon: Package },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function CustomerRepairDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') { router.push('/login'); return; }
    fetch(`/api/customer/repairs?repairId=${params.id}&customerId=${user._id}`)
      .then(r => { if (!r.ok) throw new Error('Repair not found'); return r.json(); })
      .then(d => setRepair(d.repair))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, router, params.id]);

  const handleDownloadBill = async () => {
    try {
      const res = await fetch(`/api/customer/download?type=repair-bill&repairId=${params.id}&customerId=${user._id}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `repair-bill-${repair?.jobNumber}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert(e.message); }
  };

  if (loading) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );
  if (!repair) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center text-center">
      <div><AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-white text-xl mb-1">Repair not found</p>
        <p className="text-gray-400 text-sm mb-4">{error}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Go Back</button>
      </div>
    </div>
  );

  const currentIdx = STATUS_FLOW.findIndex(s => s.value === repair.repairStatus);

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="customer" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Repair Details" breadcrumbs={['Customer', 'Repairs', repair.jobNumber]} />
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" /> Back to Repairs
          </button>

          {/* Status Progress */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-5 border border-white/10">
            <h3 className="text-white font-bold mb-4">Repair Progress</h3>
            <div className="flex items-center">
              {STATUS_FLOW.map((s, i) => {
                const Icon = s.icon;
                const isActive = repair.repairStatus === s.value;
                const isPast = currentIdx > i;
                return (
                  <div key={s.value} className="flex items-center flex-1">
                    <div className={`flex flex-col items-center gap-1 ${isActive ? 'text-blue-400' : isPast ? 'text-green-400' : 'text-gray-600'}`}>
                      <div className={`p-2 rounded-full border ${isActive ? 'border-blue-500/40 bg-blue-500/10' : isPast ? 'border-green-500/30 bg-green-500/10' : 'border-gray-700'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs whitespace-nowrap hidden sm:block">{s.label}</span>
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 ${isPast ? 'bg-green-500/40' : 'bg-gray-700'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              {/* Job Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6 border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-white font-bold text-lg">Job Information</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${STATUS_STYLE[repair.repairStatus] || ''}`}>
                      {repair.repairStatus?.replace(/-/g, ' ').toUpperCase()}
                    </span>
                    {repair.repairStatus === 'delivered' && (
                      <button onClick={handleDownloadBill}
                        className="flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs transition-all">
                        <Download className="w-3.5 h-3.5" /> Download Bill
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-400 text-xs mb-1">Job Number</p><p className="text-blue-400 font-mono">{repair.jobNumber}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">IMEI</p><p className="text-white font-mono text-xs">{repair.imei}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Device</p><p className="text-white">{repair.device?.brand} {repair.device?.model}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Started</p><p className="text-white">{repair.startDate ? new Date(repair.startDate).toLocaleDateString() : '—'}</p></div>
                  {repair.repairStatus === 'delivered' && (
                    <div><p className="text-gray-400 text-xs mb-1">Closed</p><p className="text-white">{repair.closedAt ? new Date(repair.closedAt).toLocaleDateString() : '—'}</p></div>
                  )}
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Warranty Claim</p>
                    {repair.warrantyApproved
                      ? <span className="px-2 py-0.5 text-xs rounded bg-purple-500/20 border border-purple-500/30 text-purple-400">Approved</span>
                      : <span className="text-gray-500">No</span>}
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-400 text-xs mb-1">Problem Description</p>
                  <p className="text-white text-sm">{repair.problemDescription}</p>
                </div>
              </motion.div>

              {/* Technical Report (visible to customer) */}
              {(repair.faultReason || repair.workDone) && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="glass rounded-xl p-5 border border-white/10">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" /> Technical Report
                  </h3>
                  <div className="space-y-3 text-sm">
                    {repair.faultReason && (
                      <div><p className="text-gray-400 text-xs mb-1">Fault Reason</p>
                        <p className="text-white bg-white/5 rounded-lg p-3">{repair.faultReason}</p></div>
                    )}
                    {repair.workDone && (
                      <div><p className="text-gray-400 text-xs mb-1">Work Done</p>
                        <p className="text-white bg-white/5 rounded-lg p-3">{repair.workDone}</p></div>
                    )}
                    {repair.technicianNotes && (
                      <div><p className="text-gray-400 text-xs mb-1">Technician Notes</p>
                        <p className="text-white bg-white/5 rounded-lg p-3">{repair.technicianNotes}</p></div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Parts */}
              {repair.parts?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="glass rounded-xl p-5 border border-white/10">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-orange-400" /> Parts Replaced
                  </h3>
                  <div className="space-y-2">
                    {repair.parts.map((p, i) => (
                      <div key={i} className="flex justify-between items-center bg-white/5 rounded-lg p-3 text-sm">
                        <div><p className="text-white font-medium">{p.name}</p>
                          <p className="text-gray-400 text-xs">{p.quantity} × ${p.unitPrice?.toFixed(2)}</p></div>
                        <p className="text-green-400 font-semibold">${p.totalPrice?.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right col */}
            <div className="space-y-5">
              {/* Bill */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="glass rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-bold mb-4">Bill</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Parts</span>
                    <span className="text-white">${(repair.totalPartsCost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Service Charges</span>
                    <span className="text-white">${(repair.totalServiceCharge || 0).toFixed(2)}</span>
                  </div>
                  {repair.warrantyApproved && (
                    <div className="flex justify-between text-purple-400">
                      <span>Warranty Cover</span>
                      <span>- ${(repair.actualCost || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white font-bold text-base">Total</span>
                    <span className="text-green-400 font-bold text-base">${(repair.finalBill || 0).toFixed(2)}</span>
                  </div>
                  {repair.repairStatus === 'delivered' && (
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-gray-400">Payment</span>
                      <span className="text-white capitalize">{repair.paymentMethod || 'cash'}</span>
                    </div>
                  )}
                </div>
                {repair.repairStatus === 'delivered' && (
                  <button onClick={handleDownloadBill}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-all">
                    <Download className="w-4 h-4" /> Download Bill PDF
                  </button>
                )}
              </motion.div>

              {/* Service Center */}
              {repair.servicecenter && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="glass rounded-xl p-5 border border-white/10">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Store className="w-4 h-4 text-purple-400" /> Service Center
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    <p className="text-white font-medium">{repair.servicecenter.shopName || repair.servicecenter.name}</p>
                    <p className="text-gray-400">{repair.servicecenter.phone || '—'}</p>
                    <p className="text-gray-400">{repair.servicecenter.address || '—'}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
