'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Shield, CheckCircle, Clock, AlertTriangle, Search } from 'lucide-react';

export default function ShopWarrantiesPage() {
  const [warranties, setWarranties] = useState([]);
  const [filteredWarranties, setFilteredWarranties] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expiringSoon: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const shopId = '675a3b42c5d5e8f9a1234567';

  useEffect(() => { fetchWarranties(); }, []);
  useEffect(() => { applyFilters(); }, [searchTerm, statusFilter, warranties]);

  const fetchWarranties = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/warranties?shopId=${shopId}`);
      const data = await res.json();
      if (data.success) {
        setWarranties(data.warranties || []);
        setStats(data.stats || { total: 0, active: 0, expiringSoon: 0, expired: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch warranties:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...warranties];
    if (searchTerm) {
      filtered = filtered.filter(w =>
        w.device?.imei?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.device?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.device?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.customer?.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(w => {
        if (statusFilter === 'expiring') return w.status === 'active' && w.daysLeft <= 30;
        return w.status === statusFilter;
      });
    }
    setFilteredWarranties(filtered);
  };

  const getStatusBadge = (warranty) => {
    if (warranty.status === 'expired' || warranty.daysLeft <= 0)
      return { label: 'EXPIRED', class: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (warranty.daysLeft <= 30)
      return { label: 'EXPIRING SOON', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    return { label: 'ACTIVE', class: 'bg-green-500/20 text-green-400 border-green-500/30' };
  };

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="shop" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Warranty Management" breadcrumbs={['Shop', 'Warranties']} />
        <div className="flex-1 overflow-auto p-6">

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Warranties', value: stats.total, color: 'text-white', icon: <Shield className="w-8 h-8 text-blue-400" /> },
              { label: 'Active', value: stats.active, color: 'text-green-400', icon: <CheckCircle className="w-8 h-8 text-green-400" /> },
              { label: 'Expiring Soon', value: stats.expiringSoon, color: 'text-amber-400', icon: <Clock className="w-8 h-8 text-amber-400" /> },
              { label: 'Expired', value: stats.expired, color: 'text-red-400', icon: <AlertTriangle className="w-8 h-8 text-red-400" /> },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{s.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                  </div>
                  {s.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="glass rounded-xl p-4 border border-white/10 mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by IMEI, device, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-lg bg-[#1a1f35] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Warranties Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Device</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Customer</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Start Date</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">End Date</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Days Left</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="text-center py-10 text-gray-400">Loading...</td></tr>
                  ) : filteredWarranties.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-10 text-gray-400">No warranties issued yet</td></tr>
                  ) : (
                    filteredWarranties.map((warranty) => {
                      const badge = getStatusBadge(warranty);
                      return (
                        <tr key={warranty.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                          <td className="py-4 px-6">
                            <p className="text-white font-medium">{warranty.device?.brand} {warranty.device?.model}</p>
                            <code className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded mt-1 inline-block">
                              {warranty.device?.imei || 'N/A'}
                            </code>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-white">{warranty.customer?.name || 'N/A'}</p>
                            <p className="text-gray-400 text-xs">{warranty.customer?.phone || ''}</p>
                          </td>
                          <td className="py-4 px-6 text-gray-300 text-sm">
                            {warranty.startDate ? new Date(warranty.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-gray-300 text-sm">
                            {warranty.expiryDate ? new Date(warranty.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`font-semibold ${warranty.daysLeft <= 0 ? 'text-red-400' : warranty.daysLeft <= 30 ? 'text-amber-400' : 'text-green-400'}`}>
                              {warranty.daysLeft <= 0 ? 'Expired' : `${warranty.daysLeft} days`}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${badge.class}`}>
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
