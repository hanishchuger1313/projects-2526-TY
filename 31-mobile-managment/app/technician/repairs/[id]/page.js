'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import {
  ArrowLeft, Loader2, Plus, Trash2, CheckCircle, AlertCircle,
  Package, Wrench, Clock, FileText, ChevronDown, ChevronUp, Lock, DollarSign
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

export default function TechnicianRepairDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const technicianId = user?.id || user?._id;

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Report fields
  const [report, setReport] = useState({ faultReason: '', workDone: '', technicianNotes: '' });
  const [reportExpanded, setReportExpanded] = useState(true);

  // New part
  const [newPart, setNewPart] = useState({ name: '', partNumber: '', quantity: 1, unitPrice: 0 });
  const [newCharge, setNewCharge] = useState({ description: '', amount: 0 });
  const [partsExpanded, setPartsExpanded] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'technician') { router.push('/login'); return; }
    fetchRepair();
  }, [isAuthenticated, user, router, params.id]);

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(''), 5000); return () => clearTimeout(t); }
  }, [error]);

  const fetchRepair = async () => {
    try {
      setLoading(true);
      if (!technicianId) return;
      const res = await fetch(`/api/technician/repairs?repairId=${params.id}&technicianId=${technicianId}`);
      if (!res.ok) throw new Error('Repair not found or not assigned to you');
      const data = await res.json();
      const r = data.repair;
      setRepair(r);
      // Pre-fill report if exists
      if (r.faultReason || r.workDone || r.technicianNotes) {
        setReport({
          faultReason: r.faultReason || '',
          workDone: r.workDone || '',
          technicianNotes: r.technicianNotes || '',
        });
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const updateStatus = async (newStatus) => {
    try {
      setSaving(true); setError('');
      const res = await fetch(`/api/technician/repairs?repairId=${repair._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repairStatus: newStatus, technicianId })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to update status'); }
      setSuccess(`Status updated to "${newStatus.replace(/-/g, ' ')}"`);
      await fetchRepair();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const saveReport = async () => {
    if (!report.faultReason && !report.workDone) { setError('Please fill in at least fault reason or work done'); return; }
    try {
      setSaving(true); setError('');
      const res = await fetch(`/api/technician/repairs?repairId=${repair._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...report, technicianId })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to save report'); }
      setSuccess('Technical report saved');
      await fetchRepair();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const addPart = async () => {
    if (!newPart.name || !newPart.unitPrice) { setError('Part name and price are required'); return; }
    try {
      setSaving(true); setError('');
      const res = await fetch('/api/technician/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repairId: repair._id, technicianId, part: newPart })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to add part'); }
      setSuccess('Part added');
      setNewPart({ name: '', partNumber: '', quantity: 1, unitPrice: 0 });
      await fetchRepair();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const removePart = async (index) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/technician/parts?repairId=${repair._id}&technicianId=${technicianId}&index=${index}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to remove part'); }
      setSuccess('Part removed');
      await fetchRepair();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const addCharge = async () => {
    if (!newCharge.description || !newCharge.amount) { setError('Charge description and amount are required'); return; }
    try {
      setSaving(true); setError('');
      const res = await fetch('/api/technician/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repairId: repair._id, technicianId, serviceCharge: newCharge })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to add charge'); }
      setSuccess('Service charge added');
      setNewCharge({ description: '', amount: 0 });
      await fetchRepair();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const removeCharge = async (index) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/technician/parts?repairId=${repair._id}&technicianId=${technicianId}&type=charge&index=${index}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to remove charge'); }
      setSuccess('Service charge removed');
      await fetchRepair();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  if (!repair) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <p className="text-white text-xl mb-2">Repair not found</p>
        <p className="text-gray-400 text-sm mb-4">{error}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Go Back</button>
      </div>
    </div>
  );

  const isClosed = repair.repairStatus === 'delivered' || repair.repairStatus === 'completed';
  const STATUS_FLOW = [
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'in-progress', label: 'In Progress', icon: Wrench },
    { value: 'waiting-parts', label: 'Waiting Parts', icon: Package },
    { value: 'completed', label: 'Completed', icon: CheckCircle },
  ];
  const currentIdx = STATUS_FLOW.findIndex(s => s.value === repair.repairStatus);

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="technician" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Repair Job" breadcrumbs={['Technician', 'Repairs', repair.jobNumber]} />
        <div className="flex-1 overflow-auto p-6 space-y-5">

          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" /> Back to Repairs
          </button>

          {/* Alerts */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
              <p className="text-green-400 text-sm">{success}</p>
            </motion.div>
          )}

          {/* Read-only delivered banner */}
          {repair.repairStatus === 'delivered' && (
            <div className="p-4 bg-gray-500/10 border border-gray-500/30 rounded-lg flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-400 shrink-0" />
              <p className="text-gray-400 text-sm">This repair has been closed and delivered. No further changes allowed.</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT — main content */}
            <div className="lg:col-span-2 space-y-5">

              {/* Job Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6 border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Job Details</h3>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${STATUS_STYLE[repair.repairStatus] || ''}`}>
                    {repair.repairStatus?.replace(/-/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-400 text-xs mb-1">Job Number</p><p className="text-blue-400 font-mono">{repair.jobNumber}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">IMEI</p><p className="text-white font-mono">{repair.imei}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Device</p><p className="text-white">{repair.device?.brand} {repair.device?.model}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Color / Storage</p><p className="text-white">{repair.device?.color || '—'} / {repair.device?.storage || '—'}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Customer</p><p className="text-white">{repair.customer?.name || '—'}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Customer Phone</p><p className="text-white">{repair.customer?.phone || '—'}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Estimated Cost</p><p className="text-white">Rs. {(repair.estimatedCost || 0).toFixed(2)}</p></div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Warranty Claim</p>
                    {repair.warrantyApproved
                      ? <span className="px-2 py-0.5 text-xs rounded bg-purple-500/20 border border-purple-500/30 text-purple-400">APPROVED</span>
                      : <span className="text-gray-500 text-sm">No</span>}
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-400 text-xs mb-1">Problem Description</p>
                  <p className="text-white text-sm">{repair.problemDescription}</p>
                </div>
                {/* Read-only notice for customer/warranty */}
                <p className="mt-3 text-gray-600 text-xs flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Customer and warranty details are read-only
                </p>
              </motion.div>

              {/* Technical Report */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass rounded-xl border border-white/10 overflow-hidden">
                <button onClick={() => setReportExpanded(!reportExpanded)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" /> Technical Report
                    {(repair.faultReason || repair.workDone) && (
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 border border-green-500/30 text-green-400 rounded">Saved</span>
                    )}
                  </h3>
                  {reportExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {reportExpanded && (
                  <div className="p-5 pt-0 space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-1 block">Fault Reason <span className="text-red-400">*</span></label>
                      <textarea value={report.faultReason}
                        onChange={e => setReport({ ...report, faultReason: e.target.value })}
                        disabled={repair.repairStatus === 'delivered'}
                        rows={3} placeholder="Describe the root cause of the fault..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-1 block">Work Done <span className="text-red-400">*</span></label>
                      <textarea value={report.workDone}
                        onChange={e => setReport({ ...report, workDone: e.target.value })}
                        disabled={repair.repairStatus === 'delivered'}
                        rows={3} placeholder="Describe what was repaired or serviced..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-1 block">Additional Notes</label>
                      <textarea value={report.technicianNotes}
                        onChange={e => setReport({ ...report, technicianNotes: e.target.value })}
                        disabled={repair.repairStatus === 'delivered'}
                        rows={2} placeholder="Any extra observations or recommendations..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>
                    {repair.repairStatus !== 'delivered' && (
                      <button onClick={saveReport} disabled={saving}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-center gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        Save Report
                      </button>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Parts Replaced */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="glass rounded-xl border border-white/10 overflow-hidden">
                <button onClick={() => setPartsExpanded(!partsExpanded)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-400" /> Parts Replaced
                    {repair.parts?.length > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded">
                        {repair.parts.length} item{repair.parts.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </h3>
                  {partsExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {partsExpanded && (
                  <div className="p-5 pt-0 space-y-4">
                    {/* Existing Parts */}
                    {repair.parts?.length > 0 ? (
                      <div className="space-y-2">
                        {repair.parts.map((part, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium">{part.name}</p>
                              <p className="text-gray-400 text-xs">{part.partNumber && `#${part.partNumber} · `}{part.quantity} × Rs. {part.unitPrice?.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <p className="text-green-400 font-semibold text-sm">Rs. {part.totalPrice?.toFixed(2)}</p>
                              {repair.repairStatus !== 'delivered' && (
                                <button onClick={() => removePart(i)} disabled={saving}
                                  className="p-1.5 hover:bg-red-500/20 rounded transition-all">
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm pt-1 border-t border-white/10">
                          <span className="text-gray-400">Parts Total</span>
                          <span className="text-green-400 font-bold">Rs. {(repair.totalPartsCost || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No parts added yet</p>
                    )}

                    {/* Existing Service Charges */}
                    {repair.serviceCharges?.length > 0 && (
                      <div className="space-y-2 border-t border-white/10 pt-4">
                        <p className="text-gray-400 text-sm font-medium">Service Charges</p>
                        {repair.serviceCharges.map((charge, i) => (
                          <div key={`charge-${i}`} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{charge.description}</p>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <p className="text-green-400 font-semibold text-sm">Rs. {(charge.amount || 0).toFixed(2)}</p>
                              {repair.repairStatus !== 'delivered' && (
                                <button onClick={() => removeCharge(i)} disabled={saving}
                                  className="p-1.5 hover:bg-red-500/20 rounded transition-all">
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Part form */}
                    {repair.repairStatus !== 'delivered' && (
                      <div className="border-t border-white/10 pt-4 space-y-3">
                        <p className="text-gray-400 text-sm font-medium">Add Replaced Part</p>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="Part name *" value={newPart.name}
                            onChange={e => setNewPart({ ...newPart, name: e.target.value })}
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <input type="text" placeholder="Part number" value={newPart.partNumber}
                            onChange={e => setNewPart({ ...newPart, partNumber: e.target.value })}
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <input type="number" placeholder="Qty" min="1" value={newPart.quantity}
                            onChange={e => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 1 })}
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <input type="number" placeholder="Unit price *" step="0.01" min="0" value={newPart.unitPrice}
                            onChange={e => setNewPart({ ...newPart, unitPrice: parseFloat(e.target.value) || 0 })}
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        {newPart.name && newPart.unitPrice > 0 && (
                          <p className="text-gray-400 text-xs text-right">
                            Subtotal: <span className="text-white font-semibold">Rs. {(newPart.quantity * newPart.unitPrice).toFixed(2)}</span>
                          </p>
                        )}
                        <button onClick={addPart} disabled={saving}
                          className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          Add Part
                        </button>

                        <div className="border-t border-white/10 pt-4 space-y-3">
                          <p className="text-gray-400 text-sm font-medium">Add Service Charge</p>
                          <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Description *" value={newCharge.description}
                              onChange={e => setNewCharge({ ...newCharge, description: e.target.value })}
                              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input type="number" placeholder="Amount *" min="0" step="0.01" value={newCharge.amount}
                              onChange={e => setNewCharge({ ...newCharge, amount: parseFloat(e.target.value) || 0 })}
                              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <button onClick={addCharge} disabled={saving}
                            className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                            Add Service Charge
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

            </div>

            {/* RIGHT — status actions */}
            <div className="space-y-5">

              {/* Status Progress */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="glass rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-bold mb-4">Status Progress</h3>
                <div className="space-y-2">
                  {STATUS_FLOW.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = repair.repairStatus === s.value;
                    const isPast = currentIdx > i;
                    return (
                      <div key={s.value} className={`flex items-center gap-3 p-3 rounded-lg border transition-all
                        ${isActive ? 'border-blue-500/40 bg-blue-500/10' : isPast ? 'border-green-500/20 bg-green-500/5' : 'border-white/5 bg-white/2'}`}>
                        <div className={`p-1.5 rounded-full ${isActive ? 'bg-blue-500/20' : isPast ? 'bg-green-500/20' : 'bg-white/5'}`}>
                          <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : isPast ? 'text-green-400' : 'text-gray-600'}`} />
                        </div>
                        <span className={`text-sm font-medium flex-1 ${isActive ? 'text-white' : isPast ? 'text-gray-400' : 'text-gray-600'}`}>
                          {s.label}
                        </span>
                        {isActive && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                        {isPast && <CheckCircle className="w-4 h-4 text-green-400" />}
                      </div>
                    );
                  })}
                  {repair.repairStatus === 'delivered' && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-green-500/30 bg-green-500/10">
                      <div className="p-1.5 rounded-full bg-green-500/20">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-green-400 text-sm font-medium">Delivered</span>
                      <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Status Action Buttons */}
              {repair.repairStatus !== 'delivered' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="glass rounded-xl p-5 border border-white/10 space-y-3">
                  <h3 className="text-white font-bold">Update Status</h3>

                  {repair.repairStatus === 'pending' && (
                    <button onClick={() => updateStatus('in-progress')} disabled={saving}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all">
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wrench className="w-5 h-5" />}
                      Start Repair
                    </button>
                  )}

                  {repair.repairStatus === 'in-progress' && (
                    <>
                      <button onClick={() => updateStatus('waiting-parts')} disabled={saving}
                        className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
                        Waiting for Parts
                      </button>
                      <button onClick={() => updateStatus('completed')} disabled={saving}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        Mark Completed
                      </button>
                    </>
                  )}

                  {repair.repairStatus === 'waiting-parts' && (
                    <button onClick={() => updateStatus('in-progress')} disabled={saving}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all">
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wrench className="w-5 h-5" />}
                      Resume Repair
                    </button>
                  )}

                  {repair.repairStatus === 'completed' && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 text-center">
                      ✓ Repair marked as completed. Awaiting service center to close the job.
                    </div>
                  )}

                  {/* ⚠ Lock notice */}
                  <p className="text-gray-600 text-xs flex items-center gap-1 pt-1">
                    <Lock className="w-3 h-3" /> Closing/delivery is managed by the service center
                  </p>
                </motion.div>
              )}

              {/* Bill Preview (read-only) */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="glass rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  Bill Preview <Lock className="w-4 h-4 text-gray-500" />
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Parts</span>
                    <span className="text-white">Rs. {(repair.totalPartsCost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Service Charges</span>
                    <span className="text-white">Rs. {(repair.totalServiceCharge || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white font-semibold">Customer Bill</span>
                    <span className="text-green-400 font-bold">Rs. {(repair.finalBill || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Actual Cost</span>
                    <span className="text-white">Rs. {(repair.actualCost || 0).toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-xs mt-3">Customer and warranty fields remain locked for technicians</p>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
