'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Shield, Wrench, AlertTriangle, Users, TrendingUp, DollarSign, Package } from 'lucide-react';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import StatsCard from '@/components/shared/StatsCard';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/analytics?type=overview');
      const data = await response.json();
      
      if (data.success) {
        setStats(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0A0F1E]">
        <Sidebar role="admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const dashboardStats = stats?.stats || {};
  const charts = stats?.charts || {};

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Admin Dashboard" breadcrumbs={['Dashboard', 'Overview']} />
        
        <div className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <Database className="w-8 h-8 text-blue-400" />
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <p className="text-2xl font-bold text-white">{dashboardStats.devices?.total || 0}</p>
              <p className="text-sm text-gray-400">Total Devices</p>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="text-green-400">✓ {dashboardStats.devices?.sold || 0} Sold</span>
                <span className="text-blue-400">• {dashboardStats.devices?.inStock || 0} Stock</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-8 h-8 text-green-400" />
                <span className="text-xs text-gray-400">Active</span>
              </div>
              <p className="text-2xl font-bold text-white">{dashboardStats.warranties?.active || 0}</p>
              <p className="text-sm text-gray-400">Active Warranties</p>
              <div className="mt-2 text-xs">
                <span className="text-amber-400">⚠ {dashboardStats.warranties?.expiringSoon || 0} Expiring Soon</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <Wrench className="w-8 h-8 text-amber-400" />
                <span className="text-xs text-gray-400">Open</span>
              </div>
              <p className="text-2xl font-bold text-white">{dashboardStats.repairs?.open || 0}</p>
              <p className="text-sm text-gray-400">Open Repairs</p>
              <div className="mt-2 text-xs">
                <span className="text-gray-400">Total: {dashboardStats.repairs?.total || 0}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <span className="text-xs text-gray-400">Alert</span>
              </div>
              <p className="text-2xl font-bold text-white">{dashboardStats.devices?.blacklisted || 0}</p>
              <p className="text-sm text-gray-400">Blacklisted Devices</p>
              <div className="mt-2 text-xs">
                <span className="text-red-400">⚠ Requires Attention</span>
              </div>
            </motion.div>
          </div>

          {/* Sales & Users Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  Rs. 
                  <h3 className="text-lg font-bold text-white">Sales Overview</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Sales</span>
                  <span className="text-white font-semibold">{dashboardStats.sales?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Revenue</span>
                  <span className="text-green-400 font-semibold">
                    Rs.{(dashboardStats.sales?.revenue || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg Sale Value</span>
                  <span className="text-white font-semibold">
                    Rs.{(dashboardStats.sales?.avgValue || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">User Statistics</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Users</span>
                  <span className="text-white font-semibold">{dashboardStats.users?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Users</span>
                  <span className="text-green-400 font-semibold">{dashboardStats.users?.active || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Pending Approval</span>
                  <span className="text-amber-400 font-semibold">{dashboardStats.users?.pending || 0}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Registrations Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Monthly Device Registrations</h3>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              {charts.monthlyRegistrations && charts.monthlyRegistrations.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={charts.monthlyRegistrations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No data available
                </div>
              )}
            </motion.div>

            {/* Device Status Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Device Status Distribution</h3>
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              {charts.devicesByStatus && charts.devicesByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={charts.devicesByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {charts.devicesByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No devices registered yet
                </div>
              )}
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass rounded-xl p-6 border border-white/10"
          >
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <a href="/admin/users" className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-center group">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white font-medium">Manage Users</p>
                <p className="text-xs text-gray-400 mt-1">{dashboardStats.users?.pending || 0} pending</p>
              </a>
              <a href="/admin/devices" className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-center group">
                <Database className="w-8 h-8 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white font-medium">IMEI Monitoring</p>
                <p className="text-xs text-gray-400 mt-1">{dashboardStats.devices?.total || 0} devices</p>
              </a>
              <a href="/admin/reports" className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-center group">
                <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white font-medium">View Reports</p>
                <p className="text-xs text-gray-400 mt-1">Analytics & Insights</p>
              </a>
              <a href="/admin/fraud" className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-center group">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white font-medium">Fraud Detection</p>
                <p className="text-xs text-gray-400 mt-1">{dashboardStats.devices?.blacklisted || 0} alerts</p>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
