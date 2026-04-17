'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Smartphone, Shield, Wrench, ChevronRight, Loader2, Search } from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const WARRANTY_COLOR = (days) => {
  if (days == null) return { text: 'No Warranty', cls: 'text-gray-500 bg-gray-500/10 border-gray-500/20' };
  if (days <= 0) return { text: 'Expired', cls: 'text-red-400 bg-red-500/10 border-red-500/20' };
  if (days <= 30) return { text: `${days}d left`, cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
  if (days <= 90) return { text: `${days}d left`, cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  return { text: `${days}d left`, cls: 'text-green-400 bg-green-500/10 border-green-500/20' };
};

export default function CustomerDevicesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [devices, setDevices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') { router.push('/login'); return; }
    const customerId = user.id || user._id;
    if (!customerId) return;
    fetch(`/api/customer/devices?customerId=${customerId}`)
      .then(r => r.json())
      .then(d => { setDevices(d.devices || []); setFiltered(d.devices || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (!search) { setFiltered(devices); return; }
    const q = search.toLowerCase();
    setFiltered(devices.filter(d =>
      d.brand?.toLowerCase().includes(q) ||
      d.model?.toLowerCase().includes(q) ||
      d.imei?.toLowerCase().includes(q) ||
      d.color?.toLowerCase().includes(q)
    ));
  }, [search, devices]);

  if (loading) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="customer" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="My Devices" breadcrumbs={['Customer', 'Devices']} />
        <div className="flex-1 overflow-auto p-6 space-y-5">

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by brand, model, IMEI, color..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {filtered.length === 0 ? (
            <div className="glass rounded-xl p-10 border border-white/10 text-center">
              <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">{search ? 'No matching devices' : 'No Devices'}</p>
              <p className="text-gray-400 text-sm">
                {search ? 'Try a different search term' : 'You have no registered devices yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((d, i) => {
                const wt = WARRANTY_COLOR(d.warrantyDaysLeft);
                return (
                  <motion.div key={d._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => router.push(`/customer/devices/${d._id}`)}
                    className="glass rounded-xl p-5 border border-white/10 hover:border-white/20 cursor-pointer hover:scale-[1.01] transition-all group">

                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-blue-500/10 p-3 rounded-xl">
                        <Smartphone className="w-6 h-6 text-blue-400" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${wt.cls}`}>
                        {wt.text}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-lg leading-tight">{d.brand} {d.model}</h3>
                    <p className="text-gray-400 font-mono text-xs mt-1">{d.imei}</p>

                    <div className="flex gap-3 mt-3 text-xs text-gray-400">
                      {d.color && <span>{d.color}</span>}
                      {d.storage && <span>· {d.storage}</span>}
                      {d.ram && <span>· {d.ram}</span>}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-amber-400">
                          <Wrench className="w-3.5 h-3.5" /> {d.repairCount || 0} repair{d.repairCount !== 1 ? 's' : ''}
                        </span>
                        {d.purchaseDate && (
                          <span className="text-gray-500">
                            Since {new Date(d.purchaseDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300 transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
