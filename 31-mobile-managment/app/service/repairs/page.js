'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Search, Plus, Filter, Loader2, Eye } from 'lucide-react';
import { STATUS_COLORS } from '@/lib/constants';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function RepairsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [repairs, setRepairs] = useState([]);
  const [filteredRepairs, setFilteredRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const servicecenterId = user?.id || user?._id;

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'service') {
      router.push('/login');
      return;
    }
    fetchRepairs();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    filterRepairs();
  }, [searchTerm, statusFilter, repairs]);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      if (!servicecenterId) return;
      const response = await fetch(`/api/servicecenter/repairs?servicecenterId=${servicecenterId}`);
      
      if (!response.ok) throw new Error('Failed to fetch repairs');
      
      const data = await response.json();
      setRepairs(data.repairs || []);
      setFilteredRepairs(data.repairs || []);
    } catch (error) {
      console.error('Error fetching repairs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRepairs = () => {
    let filtered = [...repairs];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(repair =>
        repair.imei.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.problemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.customerDetails?.[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(repair => repair.repairStatus === statusFilter);
    }

    setFilteredRepairs(filtered);
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
        <TopBar title="Repairs Management" breadcrumbs={['Service', 'Repairs']} />
        
        <div className="flex-1 overflow-auto p-6">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by IMEI, customer, or issue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting-parts">Waiting for Parts</option>
              <option value="completed">Completed</option>
              <option value="delivered">Delivered</option>
            </select>

            {/* New Repair Button */}
            <button
              onClick={() => router.push('/service/repairs/new')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              New Repair
            </button>
          </div>

          {/* Repairs Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">IMEI</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Customer</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Issue</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Technician</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Warranty</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Cost</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Date</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRepairs.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-8 text-gray-400">
                        No repairs found
                      </td>
                    </tr>
                  ) : (
                    filteredRepairs.map((repair) => (
                      <tr 
                        key={repair._id} 
                        className="border-b border-white/5 hover:bg-white/5 transition-all"
                      >
                        <td className="py-4 px-6 text-gray-300 font-mono text-sm">{repair.imei}</td>
                        <td className="py-4 px-6 text-white">
                          {repair.customerDetails?.[0]?.name || 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-gray-300 max-w-xs truncate">
                          {repair.problemDescription}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${STATUS_COLORS[repair.repairStatus]}`}>
                            {repair.repairStatus.replace('-', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {repair.technicianDetails?.[0]?.name || 'Unassigned'}
                        </td>
                        <td className="py-4 px-6">
                          {repair.warrantyApproved ? (
                            <span className="px-3 py-1 rounded-lg text-xs font-medium border bg-purple-500/20 border-purple-500/30 text-purple-400">
                              YES
                            </span>
                          ) : (
                            <span className="text-gray-500">NO</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-green-400 font-semibold">
                          Rs. {(repair.finalBill || repair.actualCost || repair.estimatedCost || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-gray-400 text-sm">
                          {new Date(repair.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => router.push(`/service/repairs/${repair._id}`)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5 text-blue-400" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="glass rounded-lg p-4 border border-white/10">
              <p className="text-gray-400 text-sm">Total Repairs</p>
              <p className="text-2xl font-bold text-white mt-1">{filteredRepairs.length}</p>
            </div>
            <div className="glass rounded-lg p-4 border border-white/10">
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {filteredRepairs.filter(r => r.repairStatus === 'pending').length}
              </p>
            </div>
            <div className="glass rounded-lg p-4 border border-white/10">
              <p className="text-gray-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {filteredRepairs.filter(r => r.repairStatus === 'in-progress').length}
              </p>
            </div>
            <div className="glass rounded-lg p-4 border border-white/10">
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {filteredRepairs.filter(r => r.repairStatus === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
