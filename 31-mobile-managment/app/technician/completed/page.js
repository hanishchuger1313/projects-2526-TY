'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Loader2, Search, Eye, CheckCircle } from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const DONE_STATUSES = ['completed', 'delivered'];

export default function TechnicianCompletedPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [repairs, setRepairs] = useState([]);
  const [search, setSearch] = useState('');

  const technicianId = user?.id || user?._id;

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'technician') {
      router.push('/login');
      return;
    }
    fetchCompletedRepairs();
  }, [isAuthenticated, user, router]);

  const fetchCompletedRepairs = async () => {
    try {
      setLoading(true);
      if (!technicianId) return;
      const res = await fetch(`/api/technician/repairs?technicianId=${technicianId}`);
      if (!res.ok) throw new Error('Failed to fetch completed repairs');
      const data = await res.json();
      setRepairs((data.repairs || []).filter((r) => DONE_STATUSES.includes(r.repairStatus)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return repairs;
    return repairs.filter((r) =>
      r.jobNumber?.toLowerCase().includes(q) ||
      r.imei?.toLowerCase().includes(q) ||
      r.problemDescription?.toLowerCase().includes(q) ||
      r.customer?.name?.toLowerCase().includes(q)
    );
  }, [repairs, search]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="technician" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Completed Jobs" breadcrumbs={['Technician', 'Completed']} />

        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div className="glass rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">Completed or Delivered</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{repairs.length}</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job number, IMEI, customer or issue"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left py-3 px-5 text-gray-400 text-sm font-medium">Job #</th>
                    <th className="text-left py-3 px-5 text-gray-400 text-sm font-medium">IMEI</th>
                    <th className="text-left py-3 px-5 text-gray-400 text-sm font-medium">Device</th>
                    <th className="text-left py-3 px-5 text-gray-400 text-sm font-medium">Status</th>
                    <th className="text-left py-3 px-5 text-gray-400 text-sm font-medium">Closed Date</th>
                    <th className="text-left py-3 px-5 text-gray-400 text-sm font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-10 text-gray-500">No completed jobs found</td></tr>
                  ) : filtered.map((r) => (
                    <tr key={r._id} className="border-t border-white/5 hover:bg-white/5 transition-all">
                      <td className="py-3 px-5 text-blue-400 font-mono text-sm">{r.jobNumber}</td>
                      <td className="py-3 px-5 text-gray-300 font-mono text-sm">{r.imei}</td>
                      <td className="py-3 px-5 text-white text-sm">{r.device?.brand} {r.device?.model}</td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${r.repairStatus === 'delivered' ? 'bg-gray-500/20 border-gray-500/30 text-gray-300' : 'bg-green-500/20 border-green-500/30 text-green-400'}`}>
                          {r.repairStatus?.replace(/-/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-gray-400 text-sm">{r.closedAt ? new Date(r.closedAt).toLocaleDateString() : (r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '—')}</td>
                      <td className="py-3 px-5">
                        <button onClick={() => router.push(`/technician/repairs/${r._id}`)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
                          <Eye className="w-4 h-4 text-blue-400" />
                        </button>
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
