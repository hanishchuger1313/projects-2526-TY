'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { ArrowLeftRight, Smartphone, CheckCircle, XCircle, Loader2, AlertCircle, User } from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const STATUS_STYLE = {
  pending: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  completed: 'bg-green-500/20 border-green-500/30 text-green-400',
  rejected: 'bg-red-500/20 border-red-500/30 text-red-400',
};

export default function CustomerTransfersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('pending');

  const customerId = user?.id || user?._id;

  const fetchTransfers = async () => {
    try {
      if (!customerId) return;
      setLoading(true);
      const res = await fetch(`/api/customer/transfer?customerId=${customerId}`);
      const d = await res.json();
      setTransfers(d.transfers || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') { router.push('/login'); return; }
    if (customerId) fetchTransfers();
  }, [isAuthenticated, user, router, customerId]);

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(''), 5000); return () => clearTimeout(t); }
  }, [error]);

  const handleAction = async (transferId, action) => {
    setProcessing(transferId + action);
    setError(''); setSuccess('');
    try {
      const res = await fetch('/api/customer/transfer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferId, action, customerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSuccess(data.message);
      await fetchTransfers();
    } catch (err) { setError(err.message); }
    finally { setProcessing(null); }
  };

  const filtered = filter === 'all' ? transfers : transfers.filter(t => t.status === filter);
  const pendingCount = transfers.filter(t => t.status === 'pending').length;

  if (loading) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="customer" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Ownership Transfers" breadcrumbs={['Customer', 'Transfers']} />
        <div className="flex-1 overflow-auto p-6 space-y-5">

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

          {pendingCount > 0 && (
            <div className="p-4 bg-purple-600/10 border border-purple-500/30 rounded-xl flex items-center gap-3">
              <ArrowLeftRight className="w-5 h-5 text-purple-400 shrink-0" />
              <p className="text-purple-300 text-sm">
                You have <span className="font-bold text-white">{pendingCount}</span> pending device transfer{pendingCount > 1 ? 's' : ''} waiting for your response.
              </p>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Accepted' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'all', label: 'All' },
            ].map(tab => (
              <button key={tab.value} onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all
                  ${filter === tab.value ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}>
                {tab.label}
                {tab.value === 'pending' && pendingCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded-full">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="glass rounded-xl p-10 border border-white/10 text-center">
              <ArrowLeftRight className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-white font-semibold">No {filter !== 'all' ? filter : ''} transfers</p>
              <p className="text-gray-400 text-sm mt-1">Device ownership transfers will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((t, i) => (
                <motion.div key={t._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className={`glass rounded-xl p-5 border transition-all
                    ${t.status === 'pending' ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/10'}`}>

                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${t.status === 'pending' ? 'bg-purple-500/10' : 'bg-white/5'}`}>
                        <Smartphone className={`w-6 h-6 ${t.status === 'pending' ? 'text-purple-400' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{t.device?.brand} {t.device?.model}</h3>
                        <p className="text-gray-400 font-mono text-xs">IMEI: {t.device?.imei}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border shrink-0 ${STATUS_STYLE[t.status] || 'border-gray-600 text-gray-400'}`}>
                      {t.status === 'completed' ? 'ACCEPTED' : t.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/10 p-1.5 rounded-full">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">From</p>
                        <p className="text-white font-medium">{t.from?.name || '—'}</p>
                      </div>
                    </div>
                    <ArrowLeftRight className="w-4 h-4 text-gray-500 mx-2" />
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-500/20 p-1.5 rounded-full">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">To (You)</p>
                        <p className="text-white font-medium">{user?.name}</p>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-gray-500 text-xs">Requested</p>
                      <p className="text-gray-300 text-xs">{new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {t.status === 'pending' && (
                    <div className="flex gap-3">
                      <button onClick={() => handleAction(t._id, 'accept')} disabled={!!processing}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-all">
                        {processing === t._id + 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Accept Transfer
                      </button>
                      <button onClick={() => handleAction(t._id, 'reject')} disabled={!!processing}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 disabled:bg-gray-600/20 text-red-400 rounded-lg font-medium transition-all">
                        {processing === t._id + 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Reject
                      </button>
                    </div>
                  )}
                  {t.status === 'completed' && (
                    <p className="text-green-400 text-sm flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Accepted on {new Date(t.completedAt).toLocaleDateString()} — device is now yours
                    </p>
                  )}
                  {t.status === 'rejected' && (
                    <p className="text-red-400 text-sm flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Rejected on {new Date(t.rejectedAt).toLocaleDateString()}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
