'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import {
  ShoppingBag, DollarSign, Package, Shield, Users, TrendingUp, AlertTriangle, ArrowUpRight,
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SHOP_ID = '675a3b42c5d5e8f9a1234567';

export default function ShopDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/shop/dashboard?shopId=${SHOP_ID}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => `Rs. ${(n || 0).toLocaleString()}`;

  const statCards = data ? [
    { label: 'Total Revenue', value: fmt(data.stats.totalRevenue), sub: `Today: ${fmt(data.stats.todayRevenue)}`, icon: <DollarSign className="w-6 h-6" />, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Total Sales', value: data.stats.totalSales, sub: `This month: ${data.stats.monthSales}`, icon: <ShoppingBag className="w-6 h-6" />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'In Stock', value: data.stats.inStockCount, sub: `Stock value: ${fmt(data.stats.stockValue)}`, icon: <Package className="w-6 h-6" />, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Active Warranties', value: data.stats.activeWarranties, sub: `Expiring soon: ${data.stats.expiringSoon}`, icon: <Shield className="w-6 h-6" />, color: data.stats.expiringSoon > 0 ? 'text-amber-400' : 'text-cyan-400', bg: data.stats.expiringSoon > 0 ? 'bg-amber-400/10' : 'bg-cyan-400/10' },
    { label: 'Customers', value: data.stats.totalCustomers, sub: `Devices sold: ${data.stats.soldCount}`, icon: <Users className="w-6 h-6" />, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  ] : [];

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="shop" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Dashboard" breadcrumbs={['Shop', 'Dashboard']} />
        <div className="flex-1 overflow-auto p-6 space-y-6">

          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400">Loading dashboard...</div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                {statCards.map((s) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${s.bg}`}>
                        <span className={s.color}>{s.icon}</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-gray-400 text-sm mt-1">{s.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{s.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Revenue Chart */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="xl:col-span-2 glass rounded-xl p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" /> Revenue (Last 6 Months)
                  </h3>
                  {data.revenueChart.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-10">No sales data yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={data.revenueChart}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid #ffffff20', borderRadius: 8 }} labelStyle={{ color: '#fff' }} formatter={v => [`Rs. ${v.toLocaleString()}`, 'Revenue']} />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>

                {/* Top Devices */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-4">Top Selling Devices</h3>
                  {data.topDevices.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-10">No sales yet</p>
                  ) : (
                    <div className="space-y-3">
                      {data.topDevices.map((d, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                            <div>
                              <p className="text-white text-sm font-medium">{d.name || 'Unknown'}</p>
                              <p className="text-gray-500 text-xs">{d.count} sold</p>
                            </div>
                          </div>
                          <span className="text-green-400 text-sm font-semibold">{fmt(d.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Recent Sales */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-white font-semibold">Recent Sales</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/5 text-gray-400 text-sm">
                        <th className="text-left py-3 px-5 font-medium">Invoice</th>
                        <th className="text-left py-3 px-5 font-medium">Device</th>
                        <th className="text-left py-3 px-5 font-medium">Customer</th>
                        <th className="text-left py-3 px-5 font-medium">Amount</th>
                        <th className="text-left py-3 px-5 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentSales.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-8 text-gray-500">No sales yet</td></tr>
                      ) : data.recentSales.map(s => (
                        <tr key={s.id} className="border-t border-white/5 hover:bg-white/5 transition-all">
                          <td className="py-3 px-5 text-blue-400 text-sm font-mono">{s.invoiceNumber}</td>
                          <td className="py-3 px-5 text-white text-sm">{s.device}</td>
                          <td className="py-3 px-5 text-gray-300 text-sm">{s.customer}</td>
                          <td className="py-3 px-5 text-green-400 text-sm font-semibold">{fmt(s.salePrice)}</td>
                          <td className="py-3 px-5 text-gray-400 text-sm">{new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Expiring Warranty Alert */}
              {data.stats.expiringSoon > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass rounded-xl p-4 border border-amber-500/30 bg-amber-500/5 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <p className="text-amber-300 text-sm">
                    <span className="font-bold">{data.stats.expiringSoon}</span> warranty/warranties expiring within 30 days. Check the Warranty tab.
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
