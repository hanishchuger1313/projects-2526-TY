'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import {
  Wrench, Smartphone, Loader2, CheckCircle, AlertCircle,
  Calendar, ChevronDown, Clock, ArrowLeft
} from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

const STATUS_STYLE = {
  pending: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  acknowledged: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  closed: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
};

export default function CustomerServiceRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  const [devices, setDevices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const preselectedDeviceId = searchParams.get('deviceId');

  const [form, setForm] = useState({
    deviceId: preselectedDeviceId || '',
    problemDescription: '',
    preferredDate: '',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') { router.push('/login'); return; }
    Promise.all([
      fetch(`/api/customer/devices?customerId=${user._id}`).then(r => r.json()),
      fetch(`/api/customer/service-request?customerId=${user._id}`).then(r => r.json()),
    ]).then(([devData, reqData]) => {
      setDevices(devData.devices || []);
      setRequests(reqData.requests || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, router, preselectedDeviceId]);

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(''), 5000); return () => clearTimeout(t); }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.deviceId || !form.problemDescription.trim()) {
      setError('Please select a device and describe the problem');
      return;
    }
    try {
      setSubmitting(true); setError('');
      const res = await fetch('/api/customer/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, customerId: user._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setSuccess('Service request submitted! A service center will contact you shortly.');
      setForm({ deviceId: preselectedDeviceId || '', problemDescription: '', preferredDate: '' });
      // Refresh requests list
      const reqData = await fetch(`/api/customer/service-request?customerId=${user._id}`).then(r => r.json());
      setRequests(reqData.requests || []);
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const selectedDevice = devices.find(d => d._id === form.deviceId);

  if (loading) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="customer" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Request Service" breadcrumbs={['Customer', 'Service Request']} />
        <div className="flex-1 overflow-auto p-6 space-y-6">

          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                <p className="text-green-400 text-sm">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Request Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-400" /> New Service Request
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Device selector */}
                <div>
                  <label className="text-gray-400 text-sm mb-1.5 block">Select Device <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <select value={form.deviceId} onChange={e => setForm({ ...form, deviceId: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                      <option value="" className="bg-gray-900">-- Select a device --</option>
                      {devices.map(d => (
                        <option key={d._id} value={d._id} className="bg-gray-900">
                          {d.brand} {d.model} — {d.imei}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {selectedDevice && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                      <Smartphone className="w-3.5 h-3.5" />
                      {selectedDevice.color} · {selectedDevice.storage}
                      {selectedDevice.warrantyDaysLeft > 0 && (
                        <span className="text-green-400 ml-1">· Warranty: {selectedDevice.warrantyDaysLeft}d left</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Problem description */}
                <div>
                  <label className="text-gray-400 text-sm mb-1.5 block">Problem Description <span className="text-red-400">*</span></label>
                  <textarea value={form.problemDescription}
                    onChange={e => setForm({ ...form, problemDescription: e.target.value })}
                    rows={4} placeholder="Describe the issue you are experiencing..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  <p className="text-gray-600 text-xs mt-1">{form.problemDescription.length}/500 characters</p>
                </div>

                {/* Preferred date */}
                <div>
                  <label className="text-gray-400 text-sm mb-1.5 block flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Preferred Service Date <span className="text-gray-600 ml-1">(optional)</span>
                  </label>
                  <input type="date" value={form.preferredDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm({ ...form, preferredDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wrench className="w-5 h-5" />}
                  {submitting ? 'Submitting...' : 'Submit Service Request'}
                </button>
              </form>
            </motion.div>

            {/* Previous Requests */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass rounded-xl border border-white/10 overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" /> My Requests
                  <span className="px-2 py-0.5 text-xs bg-white/10 rounded text-gray-300">{requests.length}</span>
                </h3>
              </div>
              <div className="divide-y divide-white/5 overflow-auto max-h-[500px]">
                {requests.length === 0 ? (
                  <div className="p-8 text-center">
                    <Wrench className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No requests yet</p>
                  </div>
                ) : requests.map((req) => (
                  <div key={req._id} className="p-4 hover:bg-white/5 transition-all">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-white text-sm font-medium">
                          {req.device?.brand} {req.device?.model}
                        </p>
                        <p className="text-gray-400 text-xs font-mono">{req.imei}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border shrink-0 ${STATUS_STYLE[req.status] || 'border-gray-600 text-gray-400'}`}>
                        {req.status?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{req.problemDescription}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                      {req.preferredDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Preferred: {new Date(req.preferredDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
