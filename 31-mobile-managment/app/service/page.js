'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import StatsCard from '@/components/shared/StatsCard';
import { Wrench, Clock, CheckCircle, DollarSign, Loader2 } from 'lucide-react';
import { STATUS_COLORS } from '@/lib/constants';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ServiceDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRepairs: 0,
    inProgress: 0,
    completed: 0,
    revenue: 0
  });
  const servicecenterId = user?.id || user?._id;

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'service') {
      router.push('/login');
      return;
    }
    fetchRepairs();
  }, [isAuthenticated, user, router]);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      if (!servicecenterId) return;
      const response = await fetch(`/api/servicecenter/repairs?servicecenterId=${servicecenterId}`);
      
      if (!response.ok) throw new Error('Failed to fetch repairs');
      
      const data = await response.json();
      setRepairs(data.repairs || []);
      
      // Calculate stats
      const totalRepairs = data.repairs.length;
      const inProgress = data.repairs.filter(r => r.repairStatus === 'in-progress').length;
      const completed = data.repairs.filter(r => r.repairStatus === 'delivered').length;
      const revenue = data.repairs
        .filter(r => r.repairStatus === 'delivered')
        .reduce((sum, r) => sum + (r.paidAmount || 0), 0);
      
      setStats({ totalRepairs, inProgress, completed, revenue });
    } catch (error) {
      console.error('Error fetching repairs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (status) => {
    const priorityMap = {
      'pending': 'amber',
      'in-progress': 'blue',
      'completed': 'green',
      'delivered': 'green'
    };
    return priorityMap[status] || 'gray';
  };

  const pendingRepairs = repairs.filter(r => r.repairStatus === 'pending');
  const inProgressRepairs = repairs.filter(r => r.repairStatus === 'in-progress');
  const completedRepairs = repairs.filter(r => r.repairStatus === 'delivered').slice(0, 5);

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
        <TopBar title="Service Center Dashboard" breadcrumbs={['Dashboard', 'Overview']} />
        
        <div className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              icon="Wrench"
              label="Total Repairs"
              value={stats.totalRepairs}
              color="blue"
            />
            <StatsCard
              icon="Clock"
              label="In Progress"
              value={stats.inProgress}
              color="amber"
            />
            <StatsCard
              icon="CheckCircle"
              label="Completed"
              value={stats.completed}
              color="green"
            />
            <StatsCard
              icon="DollarSign"
              label="Revenue"
              value={`Rs. ${stats.revenue.toFixed(2)}`}
              color="purple"
            />
          </div>

          {/* Repair Jobs Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Pending Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Pending Jobs ({pendingRepairs.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingRepairs.length === 0 ? (
                  <p className="text-gray-400 text-sm">No pending repairs</p>
                ) : (
                  pendingRepairs.map((repair) => (
                    <div 
                      key={repair._id} 
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                      onClick={() => router.push(`/service/repairs/${repair._id}`)}
                    >
                      <p className="text-white font-semibold text-sm">{repair.problemDescription}</p>
                      <p className="text-gray-400 text-xs mt-1">IMEI: {repair.imei}</p>
                      <p className="text-gray-400 text-xs">
                        Customer: {repair.customerDetails?.[0]?.name || 'N/A'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400 text-xs">
                          {new Date(repair.createdAt).toLocaleDateString()}
                        </span>
                        {repair.warrantyApproved && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 border border-purple-500/30 text-purple-400">
                            WARRANTY
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* In Progress Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                In Progress ({inProgressRepairs.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {inProgressRepairs.length === 0 ? (
                  <p className="text-gray-400 text-sm">No repairs in progress</p>
                ) : (
                  inProgressRepairs.map((repair) => (
                    <div 
                      key={repair._id} 
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                      onClick={() => router.push(`/service/repairs/${repair._id}`)}
                    >
                      <p className="text-white font-semibold text-sm">{repair.problemDescription}</p>
                      <p className="text-gray-400 text-xs mt-1">IMEI: {repair.imei}</p>
                      <p className="text-gray-400 text-xs">
                        Technician: {repair.technicianDetails?.[0]?.name || 'Unassigned'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400 text-xs">
                          Started: {new Date(repair.startDate).toLocaleDateString()}
                        </span>
                        {repair.finalBill > 0 && (
                          <span className="text-green-400 font-semibold text-sm">
                            Rs. {repair.finalBill.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Completed Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Recently Completed
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {completedRepairs.length === 0 ? (
                  <p className="text-gray-400 text-sm">No completed repairs</p>
                ) : (
                  completedRepairs.map((repair) => (
                    <div 
                      key={repair._id} 
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                      onClick={() => router.push(`/service/repairs/${repair._id}`)}
                    >
                      <p className="text-white font-semibold text-sm">{repair.problemDescription}</p>
                      <p className="text-gray-400 text-xs mt-1">IMEI: {repair.imei}</p>
                      <p className="text-gray-400 text-xs">
                        Customer: {repair.customerDetails?.[0]?.name || 'N/A'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-green-400 text-xs">
                          ✓ {new Date(repair.completionDate).toLocaleDateString()}
                        </span>
                        <span className="text-green-400 font-semibold text-sm">
                          Rs. {(repair.paidAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Recent Repairs Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-6 border border-white/10"
          >
            <h3 className="text-lg font-bold text-white mb-4">All Repair Jobs</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">IMEI</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Issue</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Technician</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Cost</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {repairs.map((repair) => (
                    <tr 
                      key={repair._id} 
                      className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer"
                      onClick={() => router.push(`/service/repairs/${repair._id}`)}
                    >
                      <td className="py-4 px-4 text-gray-300 font-mono text-sm">{repair.imei}</td>
                      <td className="py-4 px-4 text-white">
                        {repair.customerDetails?.[0]?.name || 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-gray-300">{repair.problemDescription}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${STATUS_COLORS[repair.repairStatus]}`}>
                          {repair.repairStatus.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {repair.technicianDetails?.[0]?.name || 'Unassigned'}
                      </td>
                      <td className="py-4 px-4 text-green-400 font-semibold">
                        Rs. {(repair.finalBill || repair.actualCost || repair.estimatedCost || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">
                        {new Date(repair.createdAt).toLocaleDateString()}
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
