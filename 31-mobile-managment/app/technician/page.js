'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Wrench, Clock, Package, CheckCircle, AlertCircle, Loader2, Eye, ArrowRight } from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function TechnicianDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const technicianId = user?.id || user?._id;
  const [stats, setStats] = useState(null);
  const [recentRepairs, setRecentRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'technician') {
      router.push('/login');
      return;
    }
    fetchDashboard();
  }, [isAuthenticated, user, router]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      if (!technicianId) return;
      const res = await fetch(`/api/technician/dashboard?technicianId=${technicianId}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      const data = await res.json();
      setStats(data.stats);
      setRecentRepairs(data.recentRepairs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const STAT_CARDS = [
    { label: 'Assigned to Me', key: 'total', icon: Wrench, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Pending', key: 'pending', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'In Progress', key: 'inProgress', icon: Wrench, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Waiting Parts', key: 'waitingParts', icon: Package, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { label: 'Completed', key: 'completed', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  ];

  const STATUS_STYLE = {
    pending: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    'in-progress': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    'waiting-parts': 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    completed: 'bg-green-500/20 border-green-500/30 text-green-400',
    delivered: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
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
        <TopBar title="Technician Dashboard" breadcrumbs={['Technician', 'Dashboard']} />
        <div className="flex-1 overflow-auto p-6 space-y-6">

          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-5 border border-white/10">
            <p className="text-gray-400 text-sm">Welcome back,</p>
            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
            <p className="text-gray-400 text-sm mt-1">Technician ID: <span className="text-blue-400 font-mono">{technicianId?.toString().slice(-8).toUpperCase()}</span></p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {STAT_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.key}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`glass rounded-xl p-4 border ${card.border}`}>
                  <div className={`${card.bg} p-2 rounded-lg w-fit mb-3`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${card.color}`}>{stats?.[card.key] ?? 0}</p>
                  <p className="text-gray-400 text-sm mt-1">{card.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Recent Repairs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-white font-bold text-lg">My Recent Jobs</h3>
              <button onClick={() => router.push('/technician/repairs')}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-all">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    {['Job #', 'IMEI', 'Device', 'Customer', 'Status', 'Date', ''].map(h => (
                      <th key={h} className="text-left py-3 px-5 text-gray-400 text-sm font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentRepairs.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-8 text-gray-500">No repairs assigned yet</td></tr>
                  ) : recentRepairs.map((r) => (
                    <tr key={r._id} className="border-t border-white/5 hover:bg-white/5 transition-all">
                      <td className="py-3 px-5 text-blue-400 font-mono text-sm">{r.jobNumber}</td>
                      <td className="py-3 px-5 text-gray-300 font-mono text-sm">{r.imei}</td>
                      <td className="py-3 px-5 text-white text-sm">{r.device?.brand} {r.device?.model}</td>
                      <td className="py-3 px-5 text-gray-300 text-sm">{r.customer?.name || '—'}</td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${STATUS_STYLE[r.repairStatus] || 'border-gray-600 text-gray-400'}`}>
                          {r.repairStatus?.replace(/-/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-gray-400 text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-5">
                        <button onClick={() => router.push(`/technician/repairs/${r._id}`)}
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
