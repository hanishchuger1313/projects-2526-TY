'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Loader2, FileText, Wrench, CheckCircle, DollarSign } from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const PERIODS = [7, 30, 90];

export default function ServiceReportsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [report, setReport] = useState(null);

  const servicecenterId = user?.id || user?._id;

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'service') {
      router.push('/login');
      return;
    }
    if (!servicecenterId) return;
    fetchReport();
  }, [isAuthenticated, user, servicecenterId, days, router]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/servicecenter/reports?servicecenterId=${servicecenterId}&days=${days}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch service reports');
      setReport(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
        <TopBar title="Service Reports" breadcrumbs={['Service', 'Reports']} />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setDays(p)}
                className={`px-4 py-2 rounded-lg border text-sm ${days === p ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
              >
                Last {p} days
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-4 border border-white/10"><p className="text-gray-400 text-sm">Total Repairs</p><p className="text-2xl font-bold text-white mt-1">{report?.summary?.totalRepairs || 0}</p></div>
            <div className="glass rounded-xl p-4 border border-white/10"><p className="text-gray-400 text-sm">Delivered</p><p className="text-2xl font-bold text-green-400 mt-1">{report?.summary?.delivered || 0}</p></div>
            <div className="glass rounded-xl p-4 border border-white/10"><p className="text-gray-400 text-sm">In Progress</p><p className="text-2xl font-bold text-amber-400 mt-1">{report?.summary?.inProgress || 0}</p></div>
            <div className="glass rounded-xl p-4 border border-white/10"><p className="text-gray-400 text-sm">Revenue</p><p className="text-2xl font-bold text-blue-400 mt-1">Rs. {(report?.summary?.totalRevenue || 0).toLocaleString()}</p></div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10"><h3 className="text-white font-semibold">Technician Performance</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="text-left py-3 px-5 text-gray-400 font-medium">Technician</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium">Total</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium">Completed</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium">Delivered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report?.technicianPerformance || []).length === 0 ? (
                      <tr><td colSpan="4" className="py-6 text-center text-gray-400">No technician data</td></tr>
                    ) : (report?.technicianPerformance || []).map((t) => (
                      <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-5 text-white">{t.name}</td>
                        <td className="py-3 px-5 text-blue-400 font-semibold">{t.total}</td>
                        <td className="py-3 px-5 text-amber-400 font-semibold">{t.completed}</td>
                        <td className="py-3 px-5 text-green-400 font-semibold">{t.delivered}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10"><h3 className="text-white font-semibold">Recent Repairs</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="text-left py-3 px-5 text-gray-400 font-medium">Job</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium">Device</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium">Bill</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report?.recentRepairs || []).length === 0 ? (
                      <tr><td colSpan="4" className="py-6 text-center text-gray-400">No repairs in selected period</td></tr>
                    ) : (report?.recentRepairs || []).slice(0, 12).map((r) => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-5 text-blue-400 font-mono text-xs">{r.jobNumber || 'N/A'}</td>
                        <td className="py-3 px-5 text-white">{r.device}</td>
                        <td className="py-3 px-5 text-gray-300">{r.repairStatus?.replace('-', ' ')}</td>
                        <td className="py-3 px-5 text-green-400 font-semibold">Rs. {(r.displayAmount || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
