'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import {
  Smartphone, Shield, Wrench, ArrowRightLeft,
  Clock, CheckCircle, AlertTriangle, Loader2,
  TrendingUp, Download, Bell
} from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function WarrantyCountdown({ expiryDate }) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return <span className="text-red-400 text-xs font-semibold">Expired</span>;
  if (diffDays <= 30) return <span className="text-amber-400 text-xs font-semibold">{diffDays}d left ⚠️</span>;
  return <span className="text-green-400 text-xs font-semibold">{diffDays}d left</span>;
}

function StatCard({ icon: Icon, label, value, color, href }) {
  const content = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`glass rounded-2xl p-5 border border-white/10 cursor-pointer bg-gradient-to-br ${color} hover:border-white/20 transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <div className="bg-white/10 p-2.5 rounded-xl">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-white/70 text-sm">{label}</p>
    </motion.div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') { router.push('/login'); return; }
    const customerId = user.id || user._id;
    if (!customerId) return;
    fetch(`/api/customer/dashboard?customerId=${customerId}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, router]);

  if (loading) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  const stats = data?.stats || {};
  const devices = data?.devices || [];
  const recentRepairs = data?.recentRepairs || [];
  const pendingTransfers = data?.pendingTransfers || 0;

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="customer" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={`Welcome back, ${user?.name?.split(' ')[0] || 'Customer'}!`} breadcrumbs={['Customer', 'Dashboard']} />
        <div className="flex-1 overflow-auto p-6 space-y-6">

          {/* Pending transfer alert */}
          {pendingTransfers > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-amber-400" />
                <p className="text-amber-300 text-sm font-medium">
                  You have <span className="font-bold">{pendingTransfers}</span> pending ownership transfer{pendingTransfers > 1 ? 's' : ''} awaiting your response.
                </p>
              </div>
              <Link href="/customer/transfers"
                className="text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-all">
                Review
              </Link>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Smartphone} label="My Devices" value={stats.totalDevices ?? 0}
              color="from-blue-600/20 to-blue-800/10" href="/customer/devices" />
            <StatCard icon={Shield} label="Active Warranties" value={stats.activeWarranties ?? 0}
              color="from-green-600/20 to-green-800/10" href="/customer/devices" />
            <StatCard icon={Wrench} label="Total Repairs" value={stats.totalRepairs ?? 0}
              color="from-purple-600/20 to-purple-800/10" href="/customer/repairs" />
            <StatCard icon={ArrowRightLeft} label="Transfers" value={stats.totalTransfers ?? 0}
              color="from-orange-600/20 to-orange-800/10" href="/customer/transfers" />
          </div>

          {/* Devices with warranty */}
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" /> My Devices & Warranty Status
              </h3>
              <Link href="/customer/devices" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">View All →</Link>
            </div>
            {devices.length === 0 ? (
              <div className="p-10 text-center">
                <Smartphone className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No devices found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {devices.slice(0, 5).map((device, i) => (
                  <motion.div key={device._id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="p-4 flex items-center gap-4 hover:bg-white/5 transition-all">
                    <div className="bg-blue-500/10 p-2.5 rounded-xl shrink-0">
                      <Smartphone className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{device.brand} {device.model}</p>
                      <p className="text-gray-400 font-mono text-xs">{device.imei}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {device.warrantyExpiry ? (
                        <>
                          <WarrantyCountdown expiryDate={device.warrantyExpiry} />
                          <p className="text-gray-500 text-xs mt-0.5">
                            {new Date(device.warrantyExpiry).toLocaleDateString()}
                          </p>
                        </>
                      ) : (
                        <span className="text-gray-500 text-xs">No warranty</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Repairs */}
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-purple-400" /> Recent Repairs
              </h3>
              <Link href="/customer/repairs" className="text-purple-400 text-sm hover:text-purple-300 transition-colors">View All →</Link>
            </div>
            {recentRepairs.length === 0 ? (
              <div className="p-10 text-center">
                <Wrench className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No repair history</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentRepairs.map((r, i) => (
                  <motion.div key={r._id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="p-4 flex items-center gap-4 hover:bg-white/5 transition-all">
                    <div className={`p-2.5 rounded-xl shrink-0 ${r.status === 'completed' ? 'bg-green-500/10' : r.status === 'in_progress' ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}>
                      {r.status === 'completed'
                        ? <CheckCircle className="w-5 h-5 text-green-400" />
                        : r.status === 'in_progress'
                          ? <TrendingUp className="w-5 h-5 text-blue-400" />
                          : <Clock className="w-5 h-5 text-amber-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{r.issueDescription}</p>
                      <p className="text-gray-400 text-xs">{r.device?.brand} {r.device?.model}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white text-sm font-semibold">${r.repairCost?.toFixed(2) || '0.00'}</p>
                      <p className="text-gray-500 text-xs">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/customer/downloads">
              <motion.div whileHover={{ scale: 1.03 }} className="glass rounded-xl border border-white/10 p-4 hover:border-blue-500/30 transition-all cursor-pointer flex items-center gap-3">
                <Download className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white text-sm font-semibold">Downloads</p>
                  <p className="text-gray-500 text-xs">Invoices & Bills</p>
                </div>
              </motion.div>
            </Link>
            <Link href="/customer/service-request">
              <motion.div whileHover={{ scale: 1.03 }} className="glass rounded-xl border border-white/10 p-4 hover:border-purple-500/30 transition-all cursor-pointer flex items-center gap-3">
                <Wrench className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white text-sm font-semibold">Request Service</p>
                  <p className="text-gray-500 text-xs">Raise repair request</p>
                </div>
              </motion.div>
            </Link>
            <Link href="/customer/transfers">
              <motion.div whileHover={{ scale: 1.03 }} className="glass rounded-xl border border-white/10 p-4 hover:border-orange-500/30 transition-all cursor-pointer flex items-center gap-3">
                <ArrowRightLeft className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-white text-sm font-semibold">Transfers</p>
                  <p className="text-gray-500 text-xs">Ownership history</p>
                </div>
              </motion.div>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
