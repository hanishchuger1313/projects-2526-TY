'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import {
  ShoppingCart, Search, CheckCircle, AlertCircle,
  FileText, DollarSign, Package, User
} from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ShopSalesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [availableDevices, setAvailableDevices] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ totalSales: 0, todaySales: 0, totalRevenue: 0, availableStock: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [showSellModal, setShowSellModal] = useState(false);
  const [sellDevice, setSellDevice] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [sellError, setSellError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const shopId = user?.id || user?._id;

  useEffect(() => {
    if (!isAuthenticated || !shopId) return;

    const load = async () => {
      setLoading(true);
      try {
        const [invRes, salesRes, custRes] = await Promise.all([
          fetch(`/api/shop/inventory?shopId=${shopId}`),
          fetch(`/api/shop/sales?shopId=${shopId}`),
          fetch(`/api/shop/customers?role=customer`),
        ]);
        const [invData, salesData, custData] = await Promise.all([
          invRes.json(), salesRes.json(), custRes.json(),
        ]);

        if (invData.success) {
          const inStock = (invData.devices || []).filter(d => d.status === 'in-stock');
          setAvailableDevices(inStock);
          setStats(prev => ({ ...prev, availableStock: inStock.length }));
        }

        if (salesData.success) {
          const sales = salesData.sales || [];
          setSalesHistory(sales);
          const today = new Date().toDateString();
          setStats(prev => ({
            ...prev,
            totalSales: sales.length,
            todaySales: sales.filter(s => new Date(s.createdAt).toDateString() === today).length,
            totalRevenue: sales.reduce((sum, s) => sum + (s.salePrice || 0), 0),
          }));
        }

        if (custData.success) setCustomers(custData.users || []);
      } catch (err) {
        console.error('Failed to load sales page data:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, shopId]);

  const fetchData = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const [invRes, salesRes] = await Promise.all([
        fetch(`/api/shop/inventory?shopId=${shopId}`),
        fetch(`/api/shop/sales?shopId=${shopId}`),
      ]);
      const [invData, salesData] = await Promise.all([invRes.json(), salesRes.json()]);

      if (invData.success) {
        const inStock = (invData.devices || []).filter(d => d.status === 'in-stock');
        setAvailableDevices(inStock);
        setStats(prev => ({ ...prev, availableStock: inStock.length }));
      }
      if (salesData.success) {
        const sales = salesData.sales || [];
        setSalesHistory(sales);
        const today = new Date().toDateString();
        setStats(prev => ({
          ...prev,
          totalSales: sales.length,
          todaySales: sales.filter(s => new Date(s.createdAt).toDateString() === today).length,
          totalRevenue: sales.reduce((sum, s) => sum + (s.salePrice || 0), 0),
        }));
      }
    } catch (err) {
      console.error('fetchData error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = availableDevices.filter(d =>
    d.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.imei?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const openSellModal = (device) => {
    setSellDevice(device);
    setSelectedCustomerId('');
    setCustomerSearch('');
    setSalePrice(device.sellingPrice?.toString() || '');
    setSellError('');
    setShowSellModal(true);
  };

  const closeSellModal = () => {
    setShowSellModal(false);
    setSellDevice(null);
    setSelectedCustomerId('');
    setCustomerSearch('');
    setSalePrice('');
    setSellError('');
  };

  const handleSale = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setSellError('Please select a customer');
      return;
    }
    setSellError('');
    setSubmitting(true);
    try {
      const response = await fetch('/api/shop/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          deviceId: sellDevice.id,
          customerId: selectedCustomerId,
          salePrice: parseFloat(salePrice),
        }),
      });
      const data = await response.json();
      if (data.success) {
        closeSellModal();
        fetchData();
        alert('Sale completed successfully! Warranty activated.');
        if (data.sale?.id) downloadInvoice(data.sale.id);
      } else {
        setSellError(data.error || 'Failed to process sale');
      }
    } catch (error) {
      setSellError('Failed to process sale');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadInvoice = (saleId) => {
    window.open(`/api/shop/invoice?saleId=${saleId}`, '_blank');
  };

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="shop" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Sales Management" breadcrumbs={['Shop', 'Sales']} />

        <div className="flex-1 overflow-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Sales', value: stats.totalSales, color: 'text-white', icon: <ShoppingCart className="w-8 h-8 text-blue-400" /> },
              { label: "Today's Sales", value: stats.todaySales, color: 'text-blue-400', icon: <CheckCircle className="w-8 h-8 text-blue-400" /> },
              { label: 'Total Revenue', value: `Rs. ${stats.totalRevenue.toLocaleString()}`, color: 'text-green-400', icon: <DollarSign className="w-8 h-8 text-green-400" /> },
              { label: 'Available Stock', value: stats.availableStock, color: 'text-amber-400', icon: <Package className="w-8 h-8 text-amber-400" /> },
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

          {/* Available for Sale */}
          <div className="glass rounded-xl border border-white/10 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Available for Sale</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {loading ? (
              <p className="text-center text-gray-400 py-8">Loading...</p>
            ) : filteredDevices.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No devices available for sale</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDevices.map((device) => (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-4 border border-white/10 hover:border-green-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-semibold">{device.brand} {device.model}</p>
                        <p className="text-gray-400 text-xs mt-1">{device.storage} • {device.color}</p>
                      </div>
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        IN STOCK
                      </span>
                    </div>
                    <div className="mb-3">
                      <code className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">{device.imei}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-xs">Selling Price</p>
                        <p className="text-green-400 font-bold text-lg">Rs. {device.sellingPrice?.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => openSellModal(device)}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all flex items-center gap-2 text-sm font-medium"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Sell
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sales History */}
          <div className="glass rounded-xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Sales History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Invoice</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Device</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Customer</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Sale Price</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Date</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Warranty</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {salesHistory.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-8 text-gray-400">No sales history</td></tr>
                  ) : (
                    salesHistory.map((sale) => (
                      <tr key={sale.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                        <td className="py-4 px-6">
                          <code className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                            {sale.invoiceNumber || sale.id?.slice(-8).toUpperCase()}
                          </code>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-white font-medium">{sale.device?.brand} {sale.device?.model}</p>
                          <p className="text-gray-400 text-xs">{sale.device?.imei}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-white">{sale.customer?.name || 'N/A'}</p>
                          <p className="text-gray-400 text-xs">{sale.customer?.phone}</p>
                        </td>
                        <td className="py-4 px-6 text-green-400 font-semibold">Rs. {sale.salePrice?.toLocaleString()}</td>
                        <td className="py-4 px-6 text-gray-300 text-sm">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            {sale.warrantyMonths || 12} months
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => downloadInvoice(sale.id)}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                            title="Download Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Sell Modal */}
      <AnimatePresence>
        {showSellModal && sellDevice && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-2xl p-6 border border-white/10 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Complete Sale</h3>
                <button onClick={closeSellModal} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>

              <div className="glass rounded-lg p-4 border border-white/10 mb-6">
                <h4 className="text-white font-semibold mb-2">{sellDevice.brand} {sellDevice.model}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">IMEI:</span><code className="ml-2 text-blue-400">{sellDevice.imei}</code></div>
                  <div><span className="text-gray-400">Storage:</span><span className="ml-2 text-white">{sellDevice.storage}</span></div>
                  <div><span className="text-gray-400">Color:</span><span className="ml-2 text-white">{sellDevice.color}</span></div>
                  <div><span className="text-gray-400">Price:</span><span className="ml-2 text-green-400 font-semibold">Rs. {sellDevice.sellingPrice}</span></div>
                </div>
              </div>

              <form onSubmit={handleSale} className="space-y-4">
                {sellError && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" /><span>{sellError}</span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Customer *</label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, phone or email..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-white/5">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        {customers.length === 0 ? 'No registered customers found' : 'No customers match your search'}
                      </div>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => setSelectedCustomerId(customer.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-white/5 last:border-0 ${
                            selectedCustomerId === customer.id
                              ? 'bg-blue-500/20 border-l-2 border-l-blue-500'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{customer.name}</p>
                            <p className="text-gray-400 text-xs truncate">{customer.phone} {customer.email ? `• ${customer.email}` : ''}</p>
                          </div>
                          {selectedCustomerId === customer.id && (
                            <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                  {selectedCustomer && (
                    <div className="mt-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-blue-300 text-sm">
                        Selected: <span className="font-semibold text-white">{selectedCustomer.name}</span>
                        <span className="text-gray-400"> ({selectedCustomer.phone})</span>
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sale Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-400 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Warranty will be auto-activated for {sellDevice.warrantyPeriod || 12} months
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeSellModal}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedCustomerId}
                    className="flex-1 px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {submitting ? 'Processing...' : 'Complete Sale'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
