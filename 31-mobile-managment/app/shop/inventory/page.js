'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Package, Plus, Search, Edit2, Trash2, DollarSign, AlertCircle, ShoppingCart, CheckCircle, User } from 'lucide-react';
import { MOBILE_BRANDS, STATUS_COLORS } from '@/lib/constants';
import { isValidImei, toImeiInputValue } from '@/lib/imei';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ShopInventoryPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [formData, setFormData] = useState({
    imei: '', brand: '', model: '', color: '', storage: '',
    purchasePrice: '', sellingPrice: '', warrantyPeriod: '12'
  });

  const [showSellModal, setShowSellModal] = useState(false);
  const [sellDevice, setSellDevice] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [sellError, setSellError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const shopId = user?.id || user?._id;

  useEffect(() => {
    if (!isAuthenticated || !shopId) return;
    fetchInventory();
    fetchCustomers();
  }, [isAuthenticated, shopId]);

  useEffect(() => { applyFilters(); }, [searchTerm, statusFilter, devices]);

  const fetchInventory = async () => {
    if (!shopId) return;
    try {
      const [invRes, statsRes] = await Promise.all([
        fetch(`/api/shop/inventory?shopId=${shopId}`),
        fetch(`/api/shop/inventory?shopId=${shopId}`),
      ]);
      const invData = await invRes.json();
      const statsData = await statsRes.json();
      if (invData.success) {
        setDevices(invData.devices || []);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/shop/customers?role=customer');
      const data = await res.json();
      if (data.success) setCustomers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...devices];
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.imei?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter(d => d.status === statusFilter);
    setFilteredDevices(filtered);
  };

  const resetForm = () => setFormData({
    imei: '', brand: '', model: '', color: '', storage: '',
    purchasePrice: '', sellingPrice: '', warrantyPeriod: '12'
  });

  const handleImeiChange = (value) => {
    setFormData({ ...formData, imei: toImeiInputValue(value) });
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!isValidImei(formData.imei)) {
      alert('IMEI must be exactly 15 digits');
      return;
    }
    try {
      const response = await fetch('/api/shop/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, shopId })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Device added successfully!');
        setShowAddModal(false);
        resetForm();
        fetchInventory();
      } else {
        alert(data.error || 'Failed to add device');
      }
    } catch (error) {
      alert('Failed to add device');
    }
  };

  const handleEditDevice = async (e) => {
    e.preventDefault();
    if (!isValidImei(formData.imei)) {
      alert('IMEI must be exactly 15 digits');
      return;
    }
    try {
      const response = await fetch('/api/shop/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: selectedDevice.id, ...formData })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Device updated successfully!');
        setShowEditModal(false);
        setSelectedDevice(null);
        resetForm();
        fetchInventory();
      } else {
        alert(data.error || 'Failed to update device');
      }
    } catch (error) {
      alert('Failed to update device');
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!confirm('Are you sure you want to delete this device?')) return;
    try {
      const response = await fetch(`/api/shop/inventory?deviceId=${deviceId}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Device deleted successfully');
        fetchInventory();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete device');
      }
    } catch (error) {
      alert('Failed to delete device');
    }
  };

  const openEditModal = (device) => {
    setSelectedDevice(device);
    setFormData({
      imei: device.imei, brand: device.brand, model: device.model,
      color: device.color, storage: device.storage,
      purchasePrice: device.purchasePrice, sellingPrice: device.sellingPrice,
      warrantyPeriod: device.warrantyPeriod || '12'
    });
    setShowEditModal(true);
  };

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
    if (!selectedCustomerId) { setSellError('Please select a customer'); return; }
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
        fetchInventory();
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

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const deviceFormFields = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">IMEI Number *</label>
        <input type="text" required value={formData.imei}
          onChange={(e) => handleImeiChange(e.target.value)}
          inputMode="numeric"
          pattern="[0-9]{15}"
          maxLength={15}
          placeholder="Enter 15-digit IMEI"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Brand *</label>
        <select required value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          className="w-full bg-[#1a1f35] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Select Brand</option>
          {MOBILE_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Model *</label>
        <input type="text" required value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Storage</label>
        <select value={formData.storage}
          onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
          className="w-full bg-[#1a1f35] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Select Storage</option>
          {['64GB','128GB','256GB','512GB','1TB'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
        <input type="text" value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Warranty Period (months)</label>
        <input type="number" value={formData.warrantyPeriod}
          onChange={(e) => setFormData({ ...formData, warrantyPeriod: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Purchase Price *</label>
        <input type="number" required step="0.01" value={formData.purchasePrice}
          onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Selling Price *</label>
        <input type="number" required step="0.01" value={formData.sellingPrice}
          onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="shop" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Inventory Management" breadcrumbs={['Shop', 'Inventory']} />

        <div className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Devices', value: stats.total, color: 'text-white', icon: <Package className="w-8 h-8 text-blue-400" /> },
                { label: 'In Stock', value: stats.inStock, color: 'text-green-400', icon: <Package className="w-8 h-8 text-green-400" /> },
                { label: 'Stock Value', value: `Rs. ${stats.totalValue?.toLocaleString() || 0}`, color: 'text-purple-400', icon: <DollarSign className="w-8 h-8 text-purple-400" /> },
                { label: 'Potential Revenue', value: `Rs. ${stats.potentialRevenue?.toLocaleString() || 0}`, color: 'text-amber-400', icon: <DollarSign className="w-8 h-8 text-amber-400" /> },
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
          )}

          {/* Search and Filters */}
          <div className="glass rounded-xl p-4 border border-white/10 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search by IMEI, brand, or model..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-lg bg-[#1a1f35] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="sold">Sold</option>
                <option value="under-repair">Under Repair</option>
              </select>
              <button onClick={() => setShowAddModal(true)}
                className="px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all flex items-center gap-2 font-medium whitespace-nowrap">
                <Plus className="w-5 h-5" /> Add Device
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">IMEI</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Device</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Purchase Price</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Selling Price</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Margin</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7" className="text-center py-8 text-gray-400">Loading...</td></tr>
                  ) : filteredDevices.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-8 text-gray-400">No devices found</td></tr>
                  ) : (
                    filteredDevices.map((device) => {
                      const margin = device.purchasePrice > 0
                        ? (((device.sellingPrice - device.purchasePrice) / device.purchasePrice) * 100).toFixed(1)
                        : 0;
                      return (
                        <tr key={device.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                          <td className="py-4 px-6">
                            <code className="text-sm text-blue-400 bg-blue-400/10 px-2 py-1 rounded">{device.imei}</code>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-white font-medium">{device.brand} {device.model}</p>
                            <p className="text-gray-400 text-xs">{device.storage} • {device.color}</p>
                          </td>
                          <td className="py-4 px-6 text-gray-300">Rs. {device.purchasePrice?.toLocaleString() || 0}</td>
                          <td className="py-4 px-6 text-green-400 font-semibold">Rs. {device.sellingPrice?.toLocaleString() || 0}</td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                              margin >= 30 ? 'bg-green-500/20 text-green-400' :
                              margin >= 15 ? 'bg-blue-500/20 text-blue-400' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>{margin}%</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${STATUS_COLORS[device.status] || ''}`}>
                              {device.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              {device.status === 'in-stock' && (
                                <>
                                  <button onClick={() => openSellModal(device)}
                                    className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all"
                                    title="Sell Device">
                                    <ShoppingCart className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => openEditModal(device)}
                                    className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all"
                                    title="Edit">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeleteDevice(device.id)}
                                    className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
                                    title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
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

      {/* Add Device Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-2xl p-6 border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Add New Device</h3>
                <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>
              <form onSubmit={handleAddDevice} className="space-y-4">
                {deviceFormFields}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">Cancel</button>
                  <button type="submit"
                    className="flex-1 px-4 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all font-medium">Add Device</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Device Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-2xl p-6 border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Edit Device</h3>
                <button onClick={() => { setShowEditModal(false); setSelectedDevice(null); resetForm(); }} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>
              <form onSubmit={handleEditDevice} className="space-y-4">
                {deviceFormFields}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowEditModal(false); setSelectedDevice(null); resetForm(); }}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">Cancel</button>
                  <button type="submit"
                    className="flex-1 px-4 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all font-medium">Update Device</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sell Device Modal */}
      <AnimatePresence>
        {showSellModal && sellDevice && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-2xl p-6 border border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Complete Sale</h3>
                <button onClick={closeSellModal} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>

              {/* Device Info */}
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

                {/* Customer Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Customer *</label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search by name, phone or email..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-white/5">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        {customers.length === 0 ? 'No registered customers found' : 'No customers match your search'}
                      </div>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <button key={customer.id} type="button"
                          onClick={() => setSelectedCustomerId(customer.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-white/5 last:border-0 ${
                            selectedCustomerId === customer.id
                              ? 'bg-blue-500/20 border-l-2 border-l-blue-500'
                              : 'hover:bg-white/5'
                          }`}>
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{customer.name}</p>
                            <p className="text-gray-400 text-xs truncate">{customer.phone}{customer.email ? ` • ${customer.email}` : ''}</p>
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

                {/* Sale Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sale Price *</label>
                  <input type="number" step="0.01" required value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-400 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Warranty will be auto-activated for {sellDevice.warrantyPeriod || 12} months
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeSellModal}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">Cancel</button>
                  <button type="submit" disabled={submitting || !selectedCustomerId}
                    className="flex-1 px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2">
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
