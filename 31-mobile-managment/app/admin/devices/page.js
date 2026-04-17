'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Smartphone, Search, Ban, CheckCircle, AlertTriangle, Filter } from 'lucide-react';
import { STATUS_COLORS } from '@/lib/constants';

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [blacklistReason, setBlacklistReason] = useState('');

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, devices]);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/admin/devices');
      const data = await response.json();
      setDevices(data.devices || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      setLoading(false);
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

    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    setFilteredDevices(filtered);
  };

  const handleBlacklist = async () => {
    if (!selectedDevice || !blacklistReason.trim()) {
      alert('Please provide a reason for blacklisting');
      return;
    }

    try {
      const response = await fetch('/api/admin/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imei: selectedDevice.imei,
          reason: blacklistReason
        })
      });

      if (response.ok) {
        alert('Device blacklisted successfully');
        setShowBlacklistModal(false);
        setSelectedDevice(null);
        setBlacklistReason('');
        fetchDevices();
      }
    } catch (error) {
      console.error('Failed to blacklist device:', error);
      alert('Failed to blacklist device');
    }
  };

  const handleRemoveBlacklist = async (device) => {
    if (!confirm('Are you sure you want to remove this device from blacklist?')) return;

    try {
      const response = await fetch('/api/admin/devices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: device.id })
      });

      if (response.ok) {
        alert('Device removed from blacklist');
        fetchDevices();
      }
    } catch (error) {
      console.error('Failed to remove blacklist:', error);
      alert('Failed to remove blacklist');
    }
  };

  const stats = {
    total: devices.length,
    inStock: devices.filter(d => d.status === 'in-stock').length,
    sold: devices.filter(d => d.status === 'sold').length,
    blacklisted: devices.filter(d => d.status === 'blacklisted').length
  };

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="IMEI Monitoring" breadcrumbs={['Admin', 'Devices']} />
        
        <div className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Devices</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <Smartphone className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">In Stock</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{stats.inStock}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Sold</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">{stats.sold}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Blacklisted</p>
                  <p className="text-2xl font-bold text-red-400 mt-1">{stats.blacklisted}</p>
                </div>
                <Ban className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="glass rounded-xl p-4 border border-white/10 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by IMEI, brand, or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="in-stock">In Stock</option>
                  <option value="sold">Sold</option>
                  <option value="under-repair">Under Repair</option>
                  <option value="blacklisted">Blacklisted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Devices Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">IMEI</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Device</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Shop</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Registered</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-400">
                        Loading devices...
                      </td>
                    </tr>
                  ) : filteredDevices.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-400">
                        {devices.length === 0 ? 'No devices registered yet' : 'No devices found'}
                      </td>
                    </tr>
                  ) : (
                    filteredDevices.map((device) => (
                      <tr key={device.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                        <td className="py-4 px-6">
                          <code className="text-sm text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                            {device.imei}
                          </code>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-white font-medium">{device.brand} {device.model}</p>
                            <p className="text-gray-400 te  xt-xs">{device.storage} • {device.color}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${STATUS_COLORS[device.status] || 'bg-gray-500/20 border-gray-500/30 text-gray-400'}`}>
                            {device.status?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-300 text-sm">
                          {device.shopName || 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-gray-300 text-sm">
                          {device.createdAt ? new Date(device.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            {device.status !== 'blacklisted' ? (
                              <button
                                onClick={() => {
                                  setSelectedDevice(device);
                                  setShowBlacklistModal(true);
                                }}
                                className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
                                title="Blacklist Device"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRemoveBlacklist(device)}
                                className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all"
                                title="Remove from Blacklist"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Blacklist Modal */}
      {showBlacklistModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 border border-white/10 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Blacklist Device</h3>
                <p className="text-sm text-gray-400">IMEI: {selectedDevice?.imei}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason for Blacklisting
              </label>
              <textarea
                value={blacklistReason}
                onChange={(e) => setBlacklistReason(e.target.value)}
                rows="4"
                placeholder="Enter the reason for blacklisting this device..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBlacklistModal(false);
                  setSelectedDevice(null);
                  setBlacklistReason('');
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBlacklist}
                className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                Blacklist Device
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
