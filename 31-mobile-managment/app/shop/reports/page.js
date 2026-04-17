'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { DollarSign, TrendingUp, ShoppingBag, Package, Shield, BarChart2 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const PERIODS = [
  { label: '7 Days', value: '7' },
  { label: '30 Days', value: '30' },
  { label: '90 Days', value: '90' },
];

export default function ShopReportsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  const shopId = user?.id || user?._id;

  useEffect(() => {
    if (!isAuthenticated || !shopId) return;
    fetchReport(period);
  }, [isAuthenticated, shopId, period]);

  const fetchReport = async (p) => {
    if (!shopId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/shop/reports?shopId=${shopId}&period=${p}`);
      const d = await res.json();
      if (d.success) setData(d);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => `Rs. ${(n || 0).toLocaleString()}`;

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="shop" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Reports" breadcrumbs={['Shop', 'Reports']} />
        <div className="flex-1 overflow-auto p-6 space-y-6">

          {/* Period Selector */}
          <div className="flex items-center gap-2">
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${period === p.value ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                {p.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400">Loading reports...</div>
          ) : !data ? null : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: 'Revenue', value: fmt(data.summary.totalRevenue), color: 'text-green-400', bg: 'bg-green-400/10', icon: <DollarSign className="w-6 h-6" /> },
                  { label: 'Profit', value: fmt(data.summary.totalProfit), color: 'text-blue-400', bg: 'bg-blue-400/10', icon: <TrendingUp className="w-6 h-6" /> },
                  { label: 'Sales', value: data.summary.totalSales, color: 'text-purple-400', bg: 'bg-purple-400/10', icon: <ShoppingBag className="w-6 h-6" /> },
                  { label: 'Profit Margin', value: `${data.summary.profitMargin}%`, color: 'text-amber-400', bg: 'bg-amber-400/10', icon: <BarChart2 className="w-6 h-6" /> },
                ].map(s => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-4 border border-white/10">
                    <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-3`}>
                      <span className={s.color}>{s.icon}</span>
                    </div>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-gray-400 text-sm mt-1">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Revenue & Profit Chart */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" /> Daily Revenue & Profit
                </h3>
                {data.dailyChart.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-10">No sales in this period</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.dailyChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid #ffffff20', borderRadius: 8 }} labelStyle={{ color: '#fff' }} formatter={v => `Rs. ${v.toLocaleString()}`} />
                      <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                      <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </motion.div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Brand Breakdown */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-4">Sales by Brand</h3>
                  {data.brandBreakdown.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No data</p>
                  ) : (
                    <div className="space-y-3">
                      {data.brandBreakdown.map((b, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">{b.brand}</span>
                            <span className="text-gray-400">{b.count} sold · {fmt(b.revenue)}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min((b.count / data.summary.totalSales) * 100, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Inventory Snapshot */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-400" /> Inventory Snapshot
                  </h3>
                  <div className="space-y-3">
                    {data.inventoryStats.map((s, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                        <span className="text-gray-300 capitalize">{s.status || 'Unknown'}</span>
                        <div className="text-right">
                          <span className="text-white font-semibold">{s.count}</span>
                          <span className="text-gray-500 text-xs ml-2">{fmt(s.value)}</span>
                        </div>
                      </div>
                    ))}
                    {data.inventoryStats.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No inventory data</p>}
                  </div>
                </motion.div>

                {/* Warranty Snapshot */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" /> Warranty Overview
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Active', value: data.warrantyStats.active, color: 'text-green-400' },
                      { label: 'Expiring Soon', value: data.warrantyStats.expiringSoon, color: 'text-amber-400' },
                      { label: 'Expired', value: data.warrantyStats.expired, color: 'text-red-400' },
                    ].map(w => (
                      <div key={w.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                        <span className="text-gray-300">{w.label}</span>
                        <span className={`font-bold text-lg ${w.color}`}>{w.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Sales Table */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-white font-semibold">Sales Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/5 text-gray-400">
                        <th className="text-left py-3 px-5 font-medium">Invoice</th>
                        <th className="text-left py-3 px-5 font-medium">Device</th>
                        <th className="text-left py-3 px-5 font-medium">Customer</th>
                        <th className="text-left py-3 px-5 font-medium">Sale Price</th>
                        <th className="text-left py-3 px-5 font-medium">Cost</th>
                        <th className="text-left py-3 px-5 font-medium">Profit</th>
                        <th className="text-left py-3 px-5 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sales.length === 0 ? (
                        <tr><td colSpan="7" className="text-center py-8 text-gray-500">No sales in this period</td></tr>
                      ) : data.sales.map(s => (
                        <tr key={s.id} className="border-t border-white/5 hover:bg-white/5 transition-all">
                          <td className="py-3 px-5 text-blue-400 font-mono">{s.invoiceNumber || '—'}</td>
                          <td className="py-3 px-5 text-white">{s.device}</td>
                          <td className="py-3 px-5 text-gray-300">{s.customer}</td>
                          <td className="py-3 px-5 text-green-400 font-semibold">{fmt(s.salePrice)}</td>
                          <td className="py-3 px-5 text-gray-400">{fmt(s.purchasePrice)}</td>
                          <td className={`py-3 px-5 font-semibold ${s.profit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{fmt(s.profit)}</td>
                          <td className="py-3 px-5 text-gray-400">{new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
