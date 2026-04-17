'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Search, Filter, Loader2, Eye, Clock, Wrench, Package, CheckCircle } from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const STATUS_STYLE = {
  pending: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  'in-progress': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  'waiting-parts': 'bg-orange-500/20 border-orange-500/30 text-orange-400',
  completed: 'bg-green-500/20 border-green-500/30 text-green-400',
  delivered: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
};

export default function TechnicianRepairsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const technicianId = user?.id || user?._id;
  const [repairs, setRepairs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'technician') { router.push('/login'); return; }
    fetchRepairs();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    let list = [...repairs];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.imei?.toLowerCase().includes(q) ||
        r.jobNumber?.toLowerCase().includes(q) ||
        r.problemDescription?.toLowerCase().includes(q) ||
        r.customer?.name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') list = list.filter(r => r.repairStatus === statusFilter);
    setFiltered(list);
  }, [search, statusFilter, repairs]);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      if (!technicianId) return;
      const res = await fetch(`/api/technician/repairs?technicianId=${technicianId}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setRepairs(data.repairs || []);
      setFiltered(data.repairs || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const COUNTS = {
    all: repairs.length,
    pending: repairs.filter(r => r.repairStatus === 'pending').length,
    'in-progress': repairs.filter(r => r.repairStatus === 'in-progress').length,
    'waiting-parts': repairs.filter(r => r.repairStatus === 'waiting-parts').length,
    completed: repairs.filter(r => r.repairStatus === 'completed').length,
  };

  if (loading) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="technician" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="My Assigned Repairs" breadcrumbs={['Technician', 'Repairs']} />
        <div className="flex-1 overflow-auto p-6 space-y-5">

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All', icon: Filter },
              { value: 'pending', label: 'Pending', icon: Clock },
              { value: 'in-progress', label: 'In Progress', icon: Wrench },
              { value: 'waiting-parts', label: 'Waiting Parts', icon: Package },
              { value: 'completed', label: 'Completed', icon: CheckCircle },
            ].map(tab => {
              const Icon = tab.icon;
              const active = statusFilter === tab.value;
              return (
                <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all
                    ${active ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'}`}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded text-xs ${active ? 'bg-blue-500' : 'bg-white/10'}`}>
                    {COUNTS[tab.value]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by IMEI, job number, issue, customer..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    {['Job #', 'IMEI', 'Device', 'Customer', 'Issue', 'Status', 'Warranty', 'Created', ''].map(h => (
                      <th key={h} className="text-left py-3 px-5 text-gray-400 text-sm font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="9" className="text-center py-12 text-gray-500">No repairs found</td></tr>
                  ) : filtered.map(r => (
                    <tr key={r._id} className="border-t border-white/5 hover:bg-white/5 transition-all cursor-pointer"
                      onClick={() => router.push(`/technician/repairs/${r._id}`)}>
                      <td className="py-3 px-5 text-blue-400 font-mono text-sm">{r.jobNumber}</td>
                      <td className="py-3 px-5 text-gray-300 font-mono text-sm">{r.imei}</td>
                      <td className="py-3 px-5 text-white text-sm whitespace-nowrap">{r.device?.brand} {r.device?.model}</td>
                      <td className="py-3 px-5 text-gray-300 text-sm">{r.customer?.name || '—'}</td>
                      <td className="py-3 px-5 text-gray-300 text-sm max-w-[200px] truncate">{r.problemDescription}</td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${STATUS_STYLE[r.repairStatus] || ''}`}>
                          {r.repairStatus?.replace(/-/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        {r.warrantyApproved
                          ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 border border-purple-500/30 text-purple-400">YES</span>
                          : <span className="text-gray-600 text-xs">NO</span>}
                      </td>
                      <td className="py-3 px-5 text-gray-400 text-sm whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-5">
                        <button onClick={e => { e.stopPropagation(); router.push(`/technician/repairs/${r._id}`); }}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
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
