'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Users, TrendingUp, ShoppingBag, Search, Phone, Mail, Smartphone } from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ShopCustomersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, returning: 0, newThisMonth: 0 });

  const shopId = user?.id || user?._id;

  useEffect(() => {
    if (!isAuthenticated || !shopId) return;

    const load = async () => {
      setLoading(true);
      try {
        // Get all customers who have bought from this shop via sales
        const [custRes, salesRes] = await Promise.all([
          fetch(`/api/shop/customers?role=customer`),
          fetch(`/api/shop/sales?shopId=${shopId}`),
        ]);
        const [custData, salesData] = await Promise.all([custRes.json(), salesRes.json()]);

        const sales = salesData.sales || [];
        // Get unique customer IDs that bought from this shop
        const shopCustomerIds = new Set(sales.map(s => s.customer?._id?.toString() || s.customerId?.toString()).filter(Boolean));

        const allCustomers = custData.users || [];
        // Filter to only customers who bought from this shop
        const shopCustomers = allCustomers.filter(c => shopCustomerIds.has(c.id));

        // Calculate stats
        const now = new Date();
        const thisMonth = shopCustomers.filter(c => {
          const created = new Date(c.createdAt);
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        });

        // Returning = bought more than once
        const purchaseCounts = {};
        sales.forEach(s => {
          const cid = s.customer?._id?.toString() || s.customerId?.toString();
          if (cid) purchaseCounts[cid] = (purchaseCounts[cid] || 0) + 1;
        });
        const returning = shopCustomers.filter(c => (purchaseCounts[c.id] || 0) > 1).length;

        // Enrich customers with their purchase count and last purchase
        const enriched = shopCustomers.map(c => {
          const custSales = sales.filter(s =>
            (s.customer?._id?.toString() || s.customerId?.toString()) === c.id
          );
          return {
            ...c,
            purchaseCount: custSales.length,
            totalSpent: custSales.reduce((sum, s) => sum + (s.salePrice || 0), 0),
            lastPurchase: custSales[0]?.createdAt || null,
            devices: custSales.map(s => `${s.device?.brand || ''} ${s.device?.model || ''}`.trim()).filter(Boolean),
          };
        });

        setCustomers(enriched);
        setFiltered(enriched);
        setStats({ total: enriched.length, returning, newThisMonth: thisMonth.length });
      } catch (err) {
        console.error('Customers load error:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, shopId]);

  useEffect(() => {
    if (!search) { setFiltered(customers); return; }
    const q = search.toLowerCase();
    setFiltered(customers.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    ));
  }, [search, customers]);

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="shop" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Customers" breadcrumbs={['Shop', 'Customers']} />
        <div className="flex-1 overflow-auto p-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Customers', value: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Returning Customers', value: stats.returning, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'New This Month', value: stats.newThisMonth, icon: ShoppingBag, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            ].map(s => (
              <div key={s.label} className="glass rounded-xl p-5 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{s.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                  </div>
                  <div className={`${s.bg} p-3 rounded-xl`}>
                    <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search by name, phone, or email..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Table */}
          <div className="glass rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Customer</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Contact</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Devices Bought</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Total Spent</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Last Purchase</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Purchases</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-10 text-gray-400">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-10 text-gray-400">
                    {customers.length === 0 ? 'No customers yet — sell a device to see customers here' : 'No matching customers'}
                  </td></tr>
                ) : filtered.map((c, i) => (
                  <motion.tr key={c.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400">
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-white font-medium">{c.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {c.phone && <p className="text-gray-300 text-sm flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {c.phone}</p>}
                      {c.email && <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><Mail className="w-3.5 h-3.5" /> {c.email}</p>}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {c.devices.slice(0, 2).map((d, di) => (
                          <span key={di} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded text-gray-300">
                            <Smartphone className="w-3 h-3" /> {d}
                          </span>
                        ))}
                        {c.devices.length > 2 && <span className="text-xs text-gray-500">+{c.devices.length - 2} more</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-green-400 font-semibold">Rs. {c.totalSpent.toLocaleString()}</td>
                    <td className="py-4 px-6 text-gray-300 text-sm">
                      {c.lastPurchase ? new Date(c.lastPurchase).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        {c.purchaseCount} purchase{c.purchaseCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
