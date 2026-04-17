'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Loader2, Search, Package } from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const PERIODS = [7, 30, 90];

export default function ServicePartsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [days, setDays] = useState(30);
  const [partUsage, setPartUsage] = useState([]);

  const servicecenterId = user?.id || user?._id;

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'service') {
      router.push('/login');
      return;
    }
    if (!servicecenterId) return;
    fetchParts();
  }, [isAuthenticated, user, servicecenterId, days, router]);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/servicecenter/reports?servicecenterId=${servicecenterId}&days=${days}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch parts usage');
      setPartUsage(data.partUsage || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return partUsage;
    return partUsage.filter((p) => p.name?.toLowerCase().includes(q));
  }, [search, partUsage]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="service" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Parts Inventory Usage" breadcrumbs={['Service', 'Parts']} />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search part name"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setDays(p)}
                  className={`px-4 py-2 rounded-lg border text-sm ${days === p ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                >
                  {p} days
                </button>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Part Name</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Quantity Used</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-8 text-gray-400">No part usage records found</td></tr>
                  ) : filtered.map((p) => (
                    <tr key={p.name} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4 px-6 text-white font-medium">{p.name}</td>
                      <td className="py-4 px-6 text-blue-400 font-semibold">{p.quantity}</td>
                      <td className="py-4 px-6 text-green-400 font-semibold">Rs. {(p.amount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">Unique Parts Used</p>
            <p className="text-2xl font-bold text-white mt-1">{filtered.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
