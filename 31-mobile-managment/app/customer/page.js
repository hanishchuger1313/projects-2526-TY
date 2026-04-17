'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import {
  Smartphone, Shield, Wrench, ArrowRight, Loader2,
  Clock, CheckCircle, AlertCircle, Bell, ArrowLeftRight
} from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const STATUS_STYLE = {
  pending: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  'in-progress': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  'waiting-parts': 'bg-orange-500/20 border-orange-500/30 text-orange-400',
  completed: 'bg-green-500/20 border-green-500/30 text-green-400',
  delivered: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
};

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recentRepairs, setRecentRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') { router.push('/login'); return; }
    const customerId = user.id || user._id;
    if (!customerId) return;
    fetch(`/api/customer/dashboard?customerId=${customerId}`)
      .then(r => r.json())
      .then(d => { setStats(d.stats); setRecentRepairs(d.recentRepairs || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, router]);

  const STAT_CARDS = [
    {
      label: 'My Devices', key: 'totalDevices', icon: Smartphone,
      color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20',
      href: '/customer/devices',
    },
    {
      label: 'Active Warranties', key: 'activeWarranties', icon: Shield,
      color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20',
      href: '/customer/devices',
    },
    {
      label: 'Expiring Soon', key: 'expiringSoon', icon: AlertCircle,
      color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
      href: '/customer/devices',
    },
    {
      label: 'Active Repairs', key: 'activeRepairs', icon: Wrench,
      color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20',
      href: '/customer/repairs',
    },
    {
      label: 'Pending Transfers', key: 'pendingTransfers', icon: ArrowLeftRight,
      color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20',
      href: '/customer/transfer',
    },
  ];

  if (loading) return (
    <div className="flex h-screen bg-[#0A0F1E] items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="customer" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="My Dashboard" breadcrumbs={['Customer', 'Dashboard']} />
        <div className="flex-1 overflow-auto p-6 space-y-6">

          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-5 border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Welcome back,</p>
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
            </div>
            {stats?.pendingTransfers > 0 && (
              <button onClick={() => router.push('/customer/transfer')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-lg text-sm hover:bg-purple-600/30 transition-all animate-pulse">
                <Bell className="w-4 h-4" />
                {stats.pendingTransfers} pending transfer{stats.pendingTransfers > 1 ? 's' : ''}
              </button>
            )}
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {STAT_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.key}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(card.href)}
                  className={`glass rounded-xl p-4 border ${card.border} cursor-pointer hover:scale-[1.02] transition-all`}>
                  <div className={`${card.bg} p-2 rounded-lg w-fit mb-3`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${card.color}`}>{stats?.[card.key] ?? 0}</p>
                  <p className="text-gray-400 text-sm mt-1">{card.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'View My Devices', desc: 'See all your registered phones', href: '/customer/devices', icon: Smartphone, color: 'from-blue-600/20 to-blue-800/10 border-blue-500/20' },
              { label: 'Repair History', desc: 'Track all repairs across devices', href: '/customer/repairs', icon: Wrench, color: 'from-orange-600/20 to-orange-800/10 border-orange-500/20' },
              { label: 'Ownership Transfers', desc: 'Accept or reject device transfers', href: '/customer/transfer', icon: ArrowLeftRight, color: 'from-purple-600/20 to-purple-800/10 border-purple-500/20' },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button key={i}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
                  onClick={() => router.push(action.href)}
                  className={`bg-gradient-to-br ${action.color} border glass rounded-xl p-5 text-left hover:scale-[1.01] transition-all group`}>
                  <Icon className="w-8 h-8 text-white/60 mb-3" />
                  <p className="text-white font-semibold">{action.label}</p>
                  <p className="text-gray-400 text-sm mt-1">{action.desc}</p>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white mt-3 transition-colors" />
                </motion.button>
              );
            })}
          </div>

          {/* Recent Repairs */}
          {recentRepairs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="glass rounded-xl border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h3 className="text-white font-bold text-lg">Recent Repairs</h3>
                <button onClick={() => router.push('/customer/repairs')}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-all">
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {recentRepairs.map((r) => (
                  <div key={r._id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/5 p-2 rounded-lg">
                        <Wrench className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{r.device?.brand} {r.device?.model}</p>
                        <p className="text-gray-400 text-xs">{r.problemDescription?.slice(0, 50)}{r.problemDescription?.length > 50 ? '…' : ''}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{r.servicecenter?.shopName || r.servicecenter?.name || 'Unknown SC'} · {new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${STATUS_STYLE[r.repairStatus] || ''}`}>
                        {r.repairStatus?.replace(/-/g, ' ').toUpperCase()}
                      </span>
                      {r.finalBill > 0 && (
                        <p className="text-green-400 text-xs mt-1 font-semibold">${r.finalBill?.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
