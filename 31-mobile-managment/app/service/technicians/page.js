'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Loader2, Users, Wrench, CheckCircle, Search } from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ServiceTechniciansPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [search, setSearch] = useState('');

  const servicecenterId = user?.id || user?._id;

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'service') {
      router.push('/login');
      return;
    }
    if (!servicecenterId) return;
    fetchData();
  }, [isAuthenticated, user, servicecenterId, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [techRes, repairsRes] = await Promise.all([
        fetch('/api/servicecenter/technicians'),
        fetch(`/api/servicecenter/repairs?servicecenterId=${servicecenterId}`)
      ]);

      const techData = await techRes.json();
      const repairData = await repairsRes.json();

      setTechnicians(techData.technicians || []);
      setRepairs(repairData.repairs || []);
    } catch (error) {
      console.error('Failed to fetch technicians page data:', error);
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return technicians
      .map((tech) => {
        const assigned = repairs.filter((r) => String(r.technicianId || '') === tech.id);
        const inProgress = assigned.filter((r) => r.repairStatus === 'in-progress').length;
        const waitingParts = assigned.filter((r) => r.repairStatus === 'waiting-parts').length;
        const completed = assigned.filter((r) => ['completed', 'delivered'].includes(r.repairStatus)).length;

        return {
          ...tech,
          assigned: assigned.length,
          inProgress,
          waitingParts,
          completed,
        };
      })
      .filter((r) => {
        if (!q) return true;
        return (
          r.name?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.phone?.toLowerCase().includes(q)
        );
      });
  }, [technicians, repairs, search]);

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
        <TopBar title="Technicians" breadcrumbs={['Service', 'Technicians']} />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 border border-white/10">
              <p className="text-gray-400 text-sm">Active Technicians</p>
              <p className="text-2xl font-bold text-white mt-1">{technicians.length}</p>
            </div>
            <div className="glass rounded-xl p-4 border border-white/10">
              <p className="text-gray-400 text-sm">Assigned Jobs</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{repairs.filter(r => r.technicianId).length}</p>
            </div>
            <div className="glass rounded-xl p-4 border border-white/10">
              <p className="text-gray-400 text-sm">Unassigned Jobs</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{repairs.filter(r => !r.technicianId).length}</p>
            </div>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search technician by name, email or phone"
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
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Technician</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Assigned</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">In Progress</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Waiting Parts</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan="5" className="py-8 text-center text-gray-400">No technicians found</td></tr>
                  ) : rows.map((tech) => (
                    <tr key={tech.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4 px-6">
                        <p className="text-white font-medium">{tech.name}</p>
                        <p className="text-gray-400 text-xs">{tech.email || tech.phone || 'No contact info'}</p>
                      </td>
                      <td className="py-4 px-6 text-blue-400 font-semibold">{tech.assigned}</td>
                      <td className="py-4 px-6 text-amber-400 font-semibold">{tech.inProgress}</td>
                      <td className="py-4 px-6 text-orange-400 font-semibold">{tech.waitingParts}</td>
                      <td className="py-4 px-6 text-green-400 font-semibold">{tech.completed}</td>
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
