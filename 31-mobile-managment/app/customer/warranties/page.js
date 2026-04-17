'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Shield, Smartphone, Loader2, Search, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

function WarrantyBadge({ daysLeft }) {
  if (daysLeft == null) return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-gray-500/10 border-gray-500/20 text-gray-400">No Warranty</span>;
  if (daysLeft <= 0) return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-red-500/10 border-red-500/20 text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> Expired</span>;
  if (daysLeft <= 30) return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-amber-500/10 border-amber-500/20 text-amber-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {daysLeft}d left</span>;
  return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-green-500/10 border-green-500/20 text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {daysLeft}d left</span>;
}

export default function CustomerWarrantiesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [warranties, setWarranties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') { router.push('/login'); return; }
    const customerId = user.id || user._id;
    if (!customerId) return;
    fetch(`/api/customer/warranties?customerId=${customerId}`)
      .then(r => r.json())
      .then(d => { setWarranties(d.warranties || []); setFiltered(d.warranties || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (!search) { setFiltered(warranties); return; }
    const q = search.toLowerCase();
    setFiltered(warranties.filter(w =>
      w.device?.brand?.toLowerCase().includes(q) ||
      w.device?.model?.toLowerCase().includes(q) ||
      w.device?.imei?.toLowerCase().includes(q)
    ));
  }, [search, warranties]);

  if (loading) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  const active = warranties.filter(w => w.daysLeft > 0).length;
  const expiringSoon = warranties.filter(w => w.daysLeft > 0 && w.daysLeft <= 30).length;
  const expired = warranties.filter(w => w.daysLeft <= 0).length;

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="customer" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="My Warranties" breadcrumbs={['Customer', 'Warranties']} />
        <div className="flex-1 overflow-auto p-6 space-y-5">

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 border border-green-500/20">
              <p className="text-3xl font-bold text-green-400">{active}</p>
              <p className="text-gray-400 text-sm mt-1">Active</p>
            </div>
            <div className="glass rounded-xl p-4 border border-amber-500/20">
              <p className="text-3xl font-bold text-amber-400">{expiringSoon}</p>
              <p className="text-gray-400 text-sm mt-1">Expiring Soon</p>
            </div>
            <div className="glass rounded-xl p-4 border border-red-500/20">
              <p className="text-3xl font-bold text-red-400">{expired}</p>
              <p className="text-gray-400 text-sm mt-1">Expired</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by brand, model or IMEI..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="glass rounded-xl p-10 border border-white/10 text-center">
              <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-white font-semibold">{search ? 'No matching warranties' : 'No warranties found'}</p>
              <p className="text-gray-400 text-sm mt-1">Warranties will appear here once your devices are registered</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((w, i) => (
                <motion.div key={w._id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="glass rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/10 p-2.5 rounded-xl shrink-0">
                        <Smartphone className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{w.device?.brand} {w.device?.model}</p>
                        <p className="text-gray-400 font-mono text-xs mt-0.5">{w.device?.imei}</p>
                      </div>
                    </div>
                    <WarrantyBadge daysLeft={w.daysLeft} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-xs text-gray-400">
                    <div>
                      <p className="text-gray-600">Warranty Type</p>
                      <p className="text-white mt-0.5 capitalize">{w.warrantyType || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Start Date</p>
                      <p className="text-white mt-0.5">{w.startDate ? new Date(w.startDate).toLocaleDateString() : '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expiry Date</p>
                      <p className={`mt-0.5 font-semibold ${w.daysLeft <= 0 ? 'text-red-400' : w.daysLeft <= 30 ? 'text-amber-400' : 'text-green-400'}`}>
                        {w.expiryDate ? new Date(w.expiryDate).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>

                  {w.terms && (
                    <p className="mt-3 text-gray-500 text-xs bg-white/5 rounded-lg p-3">{w.terms}</p>
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
