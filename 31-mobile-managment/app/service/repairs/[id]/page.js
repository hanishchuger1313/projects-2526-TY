'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import {
  ArrowLeft, Loader2, Plus, Trash2, Save, CheckCircle,
  AlertCircle, Package, DollarSign, Wrench, Clock
} from 'lucide-react';
import { STATUS_COLORS } from '@/lib/constants';
import useAuthStore from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';

export default function RepairDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newPart, setNewPart] = useState({ name: '', partNumber: '', quantity: 1, unitPrice: 0 });
  const [newCharge, setNewCharge] = useState({ description: '', amount: 0 });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'service') {
      router.push('/login');
      return;
    }
    fetchRepair();
  }, [isAuthenticated, user, router, params.id]);

  // Auto-clear messages
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(''), 5000); return () => clearTimeout(t); }
  }, [error]);

  const fetchRepair = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/servicecenter/repairs?repairId=${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch repair');
      const data = await response.json();
      setRepair(data.repairs?.[0] || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addPart = async () => {
    if (!newPart.name || !newPart.unitPrice) { setError('Please fill in part name and price'); return; }
    try {
      setUpdating(true); setError('');
      const response = await fetch('/api/servicecenter/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repairId: repair._id, parts: [newPart], serviceCharges: [] })
      });
      if (!response.ok) throw new Error('Failed to add part');
      setSuccess('Part added successfully');
      setNewPart({ name: '', partNumber: '', quantity: 1, unitPrice: 0 });
      await fetchRepair();
    } catch (err) { setError(err.message); }
    finally { setUpdating(false); }
  };

  const addCharge = async () => {
    if (!newCharge.description || !newCharge.amount) { setError('Please fill in description and amount'); return; }
    try {
      setUpdating(true); setError('');
      const response = await fetch('/api/servicecenter/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repairId: repair._id, parts: [], serviceCharges: [newCharge] })
      });
      if (!response.ok) throw new Error('Failed to add charge');
      setSuccess('Service charge added');
      setNewCharge({ description: '', amount: 0 });
      await fetchRepair();
    } catch (err) { setError(err.message); }
    finally { setUpdating(false); }
  };

  const removePart = async (index) => {
    try {
      const response = await fetch(
        `/api/servicecenter/parts?repairId=${repair._id}&type=part&index=${index}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to remove part');
      setSuccess('Part removed');
      await fetchRepair();
    } catch (err) { setError(err.message); }
  };

  const removeCharge = async (index) => {
    try {
      const response = await fetch(
        `/api/servicecenter/parts?repairId=${repair._id}&type=charge&index=${index}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to remove charge');
      setSuccess('Charge removed');
      await fetchRepair();
    } catch (err) { setError(err.message); }
  };

  // Fixed: uses correct PATCH endpoint with query param
  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true); setError('');
      const response = await fetch(`/api/servicecenter/repairs?repairId=${repair._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repairStatus: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status');
      setSuccess(`Status updated to ${newStatus.replace('-', ' ')}`);
      await fetchRepair();
    } catch (err) { setError(err.message); }
    finally { setUpdating(false); }
  };

  const closeRepair = async () => {
    if (!confirm('Close this repair? This cannot be undone.')) return;
    try {
      setUpdating(true); setError('');
      const response = await fetch('/api/servicecenter/close-repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repairId: repair._id, paymentMethod: 'cash', paidAmount: repair.finalBill })
      });
      if (!response.ok) throw new Error('Failed to close repair');
      setSuccess('Repair closed successfully!');
      setTimeout(() => router.push('/service/repairs'), 1500);
    } catch (err) { setError(err.message); }
    finally { setUpdating(false); }
  };

  // Helper: get field from lookup result (could be array from aggregate or direct object)
  const getField = (val) => Array.isArray(val) ? val[0] : val;

  if (loading) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  if (!repair) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <p className="text-white text-xl">Repair not found</p>
        <button onClick={() => router.back()} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          Go Back
        </button>
      </div>
    </div>
  );

  const device = getField(repair.device) || getField(repair.deviceDetails);
  const customer = getField(repair.customer) || getField(repair.customerDetails);
  const technician = getField(repair.technician) || getField(repair.technicianDetails);
  const isClosed = repair.repairStatus === 'delivered';

  const STATUS_FLOW = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-400' },
    { value: 'in-progress', label: 'In Progress', icon: Wrench, color: 'text-blue-400' },
    { value: 'waiting-parts', label: 'Waiting for Parts', icon: Package, color: 'text-orange-400' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'text-green-400' },
  ];

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="service" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Repair Details" breadcrumbs={['Service', 'Repairs', repair.jobNumber || 'Details']} />

        <div className="flex-1 overflow-auto p-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-all">
            <ArrowLeft className="w-5 h-5" /> Back to Repairs
          </button>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              <p className="text-green-400 text-sm">{success}</p>
            </motion.div>
          )}

          {/* Status Progress Bar */}
          <div className="glass rounded-xl p-4 border border-white/10 mb-6">
            <div className="flex items-center justify-between">
              {STATUS_FLOW.map((s, i) => {
                const Icon = s.icon;
                const isActive = repair.repairStatus === s.value;
                const isPast = STATUS_FLOW.findIndex(x => x.value === repair.repairStatus) > i;
                return (
                  <div key={s.value} className="flex items-center flex-1">
                    <div className={`flex flex-col items-center gap-1 ${isActive ? s.color : isPast ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className={`p-2 rounded-full border ${isActive ? 'border-current bg-current/10' : isPast ? 'border-gray-500 bg-gray-500/10' : 'border-gray-700'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs whitespace-nowrap">{s.label}</span>
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${isPast ? 'bg-gray-500' : 'bg-gray-700'}`} />
                    )}
                  </div>
                );
              })}
              {isClosed && (
                <div className="flex items-center">
                  <div className="h-0.5 w-4 mx-2 bg-green-500" />
                  <div className="flex flex-col items-center gap-1 text-green-400">
                    <div className="p-2 rounded-full border border-green-400 bg-green-400/10">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs">Delivered</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6 border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Repair Information</h3>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${STATUS_COLORS[repair.repairStatus] || 'border-gray-500 text-gray-400'}`}>
                    {repair.repairStatus?.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-400">Job Number</p><p className="text-white font-mono">{repair.jobNumber}</p></div>
                  <div><p className="text-gray-400">IMEI</p><p className="text-white font-mono">{repair.imei}</p></div>
                  <div><p className="text-gray-400">Device</p><p className="text-white">{device?.brand} {device?.model}</p></div>
                  <div><p className="text-gray-400">Customer</p><p className="text-white">{customer?.name || 'N/A'}</p></div>
                  <div><p className="text-gray-400">Customer Phone</p><p className="text-white">{customer?.phone || '—'}</p></div>
                  <div><p className="text-gray-400">Technician</p><p className="text-white">{technician?.name || 'Unassigned'}</p></div>
                  <div><p className="text-gray-400">Start Date</p><p className="text-white">{repair.startDate ? new Date(repair.startDate).toLocaleDateString() : '—'}</p></div>
                  <div><p className="text-gray-400">Warranty</p>
                    {repair.warrantyApproved
                      ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 border border-purple-500/30 text-purple-400">APPROVED</span>
                      : <span className="text-gray-500 text-sm">No</span>}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-gray-400 text-sm mb-1">Problem Description</p>
                  <p className="text-white">{repair.problemDescription}</p>
                </div>
                {repair.customerComplaints && repair.customerComplaints !== repair.problemDescription && (
                  <div className="mt-3">
                    <p className="text-gray-400 text-sm mb-1">Customer Complaints</p>
                    <p className="text-white">{repair.customerComplaints}</p>
                  </div>
                )}
              </motion.div>

              {/* Parts & Charges - only when not delivered */}
              {!isClosed && (
                <>
                  {/* Add Parts */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-400" /> Add Parts
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input type="text" placeholder="Part name *" value={newPart.name}
                        onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="text" placeholder="Part number (optional)" value={newPart.partNumber}
                        onChange={(e) => setNewPart({ ...newPart, partNumber: e.target.value })}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="number" placeholder="Quantity" min="1" value={newPart.quantity}
                        onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 1 })}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="number" placeholder="Unit price *" step="0.01" min="0" value={newPart.unitPrice}
                        onChange={(e) => setNewPart({ ...newPart, unitPrice: parseFloat(e.target.value) || 0 })}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="text-right text-sm text-gray-400 mb-3">
                      Subtotal: <span className="text-white font-semibold">
                        Rs. {((newPart.quantity || 1) * (newPart.unitPrice || 0)).toFixed(2)}
                      </span>
                    </div>
                    <button onClick={addPart} disabled={updating}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-center gap-2">
                      {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                      Add Part
                    </button>
                  </motion.div>

                  {/* Add Service Charges */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-400" /> Add Service Charge
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input type="text" placeholder="Description *" value={newCharge.description}
                        onChange={(e) => setNewCharge({ ...newCharge, description: e.target.value })}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="number" placeholder="Amount *" step="0.01" min="0" value={newCharge.amount}
                        onChange={(e) => setNewCharge({ ...newCharge, amount: parseFloat(e.target.value) || 0 })}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={addCharge} disabled={updating}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-center gap-2">
                      {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                      Add Charge
                    </button>
                  </motion.div>
                </>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Bill Summary */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Bill Summary</h3>

                {repair.parts?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Parts</p>
                    <div className="space-y-2">
                      {repair.parts.map((part, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="text-white truncate">{part.name}</p>
                            <p className="text-gray-400 text-xs">{part.quantity} × Rs. {part.unitPrice?.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <p className="text-green-400 font-semibold">Rs. {part.totalPrice?.toFixed(2)}</p>
                            {!isClosed && (
                              <button onClick={() => removePart(i)} className="p-1 hover:bg-red-500/20 rounded transition-all">
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {repair.serviceCharges?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Service Charges</p>
                    <div className="space-y-2">
                      {repair.serviceCharges.map((charge, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <p className="text-white flex-1 min-w-0 truncate">{charge.description}</p>
                          <div className="flex items-center gap-2 ml-2">
                            <p className="text-green-400 font-semibold">Rs. {charge.amount?.toFixed(2)}</p>
                            {!isClosed && (
                              <button onClick={() => removeCharge(i)} className="p-1 hover:bg-red-500/20 rounded transition-all">
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {repair.parts?.length === 0 && repair.serviceCharges?.length === 0 && (
                  <p className="text-gray-500 text-sm mb-4">No parts or charges added yet</p>
                )}

                <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Parts Total</span>
                    <span className="text-white font-semibold">Rs. {(repair.totalPartsCost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Service Total</span>
                    <span className="text-white font-semibold">Rs. {(repair.totalServiceCharge || 0).toFixed(2)}</span>
                  </div>
                  {repair.warrantyApproved && (
                    <div className="flex justify-between text-purple-400">
                      <span>Warranty (Full Cover)</span>
                      <span className="font-semibold">- Rs. {(repair.actualCost || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Actual Cost</span>
                    <span className="text-white font-semibold">Rs. {(repair.actualCost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t border-white/10">
                    <span className="text-white font-bold">Final Bill</span>
                    <span className="text-green-400 font-bold">Rs. {(repair.finalBill || 0).toFixed(2)}</span>
                  </div>
                  {repair.estimatedCost > 0 && (
                    <p className="text-gray-500 text-xs">Estimated: Rs. {repair.estimatedCost?.toFixed(2)}</p>
                  )}
                </div>
              </motion.div>

              {/* Status Actions */}
              {!isClosed && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="glass rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Update Status</h3>
                  <div className="space-y-2">
                    {repair.repairStatus === 'pending' && (
                      <button onClick={() => updateStatus('in-progress')} disabled={updating}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-center gap-2">
                        {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wrench className="w-5 h-5" />}
                        Start Repair
                      </button>
                    )}
                    {repair.repairStatus === 'in-progress' && (
                      <>
                        <button onClick={() => updateStatus('waiting-parts')} disabled={updating}
                          className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-center gap-2">
                          {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
                          Mark: Waiting for Parts
                        </button>
                        <button onClick={() => updateStatus('completed')} disabled={updating}
                          className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-center gap-2">
                          {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                          Mark as Completed
                        </button>
                      </>
                    )}
                    {repair.repairStatus === 'waiting-parts' && (
                      <button onClick={() => updateStatus('in-progress')} disabled={updating}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-center gap-2">
                        {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wrench className="w-5 h-5" />}
                        Resume Repair
                      </button>
                    )}
                    {repair.repairStatus === 'completed' && (
                      <button onClick={closeRepair} disabled={updating}
                        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-center gap-2">
                        {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        Close & Mark Delivered
                      </button>
                    )}
                    {/* Allow closing from in-progress too */}
                    {repair.repairStatus === 'in-progress' && (
                      <button onClick={closeRepair} disabled={updating}
                        className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
                        Skip to Close Repair
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Closed Info */}
              {isClosed && (
                <div className="glass rounded-xl p-5 border border-green-500/30 bg-green-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-semibold">Repair Closed</h3>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-400">Closed: <span className="text-white">{repair.closedAt ? new Date(repair.closedAt).toLocaleString() : '—'}</span></p>
                    <p className="text-gray-400">Payment: <span className="text-white capitalize">{repair.paymentMethod || 'cash'}</span></p>
                    <p className="text-gray-400">Paid: <span className="text-green-400 font-bold">Rs. {(repair.paidAmount || 0).toFixed(2)}</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
