'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Loader2, Search, Shield, CheckCircle, Clock, XCircle } from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { STATUS_COLORS } from '@/lib/constants';

export default function ServiceWarrantiesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState('');

  const servicecenterId = user?.id || user?._id;

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'service') {
      router.push('/login');
      return;
    }
    if (!servicecenterId) return;
    fetchClaims();
  }, [isAuthenticated, user, servicecenterId, router]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/servicecenter/warranties?servicecenterId=${servicecenterId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch warranty claims');
      setClaims(data.claims || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return claims;
    return claims.filter((c) => (
      c.imei?.toLowerCase().includes(q) ||
      c.jobNumber?.toLowerCase().includes(q) ||
      c.device?.brand?.toLowerCase().includes(q) ||
      c.device?.model?.toLowerCase().includes(q) ||
      c.customer?.name?.toLowerCase().includes(q)
    ));
  }, [claims, query]);

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
        <TopBar title="Warranty Claims" breadcrumbs={['Service', 'Warranty Claims']} />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-4 border border-white/10"><p className="text-gray-400 text-sm">Total Claims</p><p className="text-2xl font-bold text-white mt-1">{stats?.totalClaims || 0}</p></div>
            <div className="glass rounded-xl p-4 border border-white/10"><p className="text-gray-400 text-sm">Approved</p><p className="text-2xl font-bold text-green-400 mt-1">{stats?.approved || 0}</p></div>
            <div className="glass rounded-xl p-4 border border-white/10"><p className="text-gray-400 text-sm">Pending Review</p><p className="text-2xl font-bold text-amber-400 mt-1">{stats?.pendingReview || 0}</p></div>
            <div className="glass rounded-xl p-4 border border-white/10"><p className="text-gray-400 text-sm">Rejected/Paid</p><p className="text-2xl font-bold text-red-400 mt-1">{stats?.rejectedOrPaid || 0}</p></div>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by job number, IMEI, customer, or device"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Job</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Device / IMEI</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Customer</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Claim</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Repair Status</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Bill / Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-8 text-gray-400">No warranty claims found</td></tr>
                  ) : filtered.map((c) => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="py-4 px-6">
                        <p className="text-white font-medium">{c.jobNumber || 'N/A'}</p>
                        <p className="text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-white">{c.device?.brand} {c.device?.model}</p>
                        <p className="text-blue-400 font-mono text-xs">{c.imei}</p>
                      </td>
                      <td className="py-4 px-6 text-gray-300">{c.customer?.name || 'N/A'}</td>
                      <td className="py-4 px-6">
                        {c.warrantyApproved ? (
                          <span className="px-2 py-1 rounded border bg-green-500/20 border-green-500/30 text-green-400 text-xs font-semibold">APPROVED</span>
                        ) : (
                          <span className="px-2 py-1 rounded border bg-red-500/20 border-red-500/30 text-red-400 text-xs font-semibold">NOT APPROVED</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded border text-xs font-semibold ${STATUS_COLORS[c.repairStatus] || 'text-gray-400 border-gray-500/30 bg-gray-500/10'}`}>
                          {c.repairStatus?.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-green-400 font-semibold">Rs. {(c.displayAmount || 0).toLocaleString()}</p>
                        {c.warrantyApproved && (c.finalBill || 0) === 0 && (c.actualCost || 0) > 0 && (
                          <p className="text-xs text-purple-400">Covered by warranty</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
