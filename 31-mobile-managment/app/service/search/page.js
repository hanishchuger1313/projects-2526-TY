'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import {
  Search, Loader2, AlertCircle, CheckCircle, Smartphone,
  User, Shield, Store, Wrench, Plus
} from 'lucide-react';
import { isValidImei, toImeiInputValue } from '@/lib/imei';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SearchDevicePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [imei, setImei] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!isValidImei(imei)) {
      setError('IMEI must be exactly 15 digits');
      setResult(null);
      return;
    }

    setSearching(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/servicecenter/search?imei=${encodeURIComponent(imei)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Device not found');

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const statusColor = (s) => {
    const map = {
      active: 'bg-green-500/20 border-green-500/30 text-green-400',
      stolen: 'bg-red-500/20 border-red-500/30 text-red-400',
      lost: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
      sold: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
      'under-repair': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    };
    return map[s] || 'bg-gray-500/20 border-gray-500/30 text-gray-400';
  };

  const repairStatusColor = (s) => {
    const map = {
      pending: 'text-amber-400',
      'in-progress': 'text-blue-400',
      'waiting-parts': 'text-orange-400',
      completed: 'text-green-400',
      delivered: 'text-gray-400',
    };
    return map[s] || 'text-gray-400';
  };

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="service" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Search Device" breadcrumbs={['Service', 'Search']} />

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-4">Search Device by IMEI</h3>
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter 15-digit IMEI number"
                    value={imei}
                    onChange={(e) => setImei(toImeiInputValue(e.target.value))}
                    inputMode="numeric"
                    pattern="[0-9]{15}"
                    maxLength={15}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !isValidImei(imei)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-all flex items-center gap-2"
                >
                  {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </form>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Stolen/Lost Warning */}
                {(result.device?.status === 'stolen' || result.device?.status === 'lost') && (
                  <div className="p-4 bg-red-600/20 border border-red-500/50 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
                    <p className="text-red-300 font-semibold">
                      ⚠ WARNING: This device is reported as {result.device.status.toUpperCase()}. Do not service this device.
                    </p>
                  </div>
                )}

                {/* Device Info */}
                <div className="glass rounded-xl p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-500/20 p-3 rounded-lg">
                        <Smartphone className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {result.device?.brand} {result.device?.model}
                        </h3>
                        <p className="text-gray-400 text-sm">IMEI: {result.device?.imei}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${statusColor(result.device?.status)}`}>
                      {result.device?.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: 'Serial Number', value: result.device?.serialNumber || '—' },
                      { label: 'Color', value: result.device?.color || '—' },
                      { label: 'Storage', value: result.device?.storage || '—' },
                      { label: 'Purchase Date', value: result.device?.purchaseDate ? new Date(result.device.purchaseDate).toLocaleDateString() : '—' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                        <p className="text-white font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="glass rounded-xl p-5 border border-white/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" /> Customer
                  </h4>
                  {result.customer ? (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-gray-400 text-xs">Name</p><p className="text-white">{result.customer.name}</p></div>
                      <div><p className="text-gray-400 text-xs">Phone</p><p className="text-white">{result.customer.phone || '—'}</p></div>
                      <div><p className="text-gray-400 text-xs">Email</p><p className="text-white">{result.customer.email || '—'}</p></div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No customer information</p>
                  )}
                </div>

                {/* Shop Info */}
                {result.shop && (
                  <div className="glass rounded-xl p-5 border border-white/10">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Store className="w-4 h-4 text-purple-400" /> Shop / Seller
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-gray-400 text-xs">Shop Name</p><p className="text-white">{result.shop.name}</p></div>
                      <div><p className="text-gray-400 text-xs">Phone</p><p className="text-white">{result.shop.phone || '—'}</p></div>
                      <div className="col-span-2"><p className="text-gray-400 text-xs">Address</p><p className="text-white">{result.shop.address || '—'}</p></div>
                    </div>
                  </div>
                )}

                {/* Warranty Info */}
                <div className="glass rounded-xl p-5 border border-white/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" /> Warranty Status
                  </h4>
                  {result.warranty ? (
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${result.warranty.valid ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                        {result.warranty.valid
                          ? <CheckCircle className="w-5 h-5 text-green-400" />
                          : <AlertCircle className="w-5 h-5 text-red-400" />}
                        <span className={`font-semibold ${result.warranty.valid ? 'text-green-400' : 'text-red-400'}`}>
                          {result.warranty.status}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-400">Expires: <span className="text-white">{new Date(result.warranty.expiryDate).toLocaleDateString()}</span></p>
                        {result.warranty.valid && (
                          <p className="text-gray-400">Days remaining: <span className="text-green-400 font-semibold">{result.warranty.daysRemaining}</span></p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No warranty on record</p>
                  )}
                </div>

                {/* Repair History */}
                <div className="glass rounded-xl p-5 border border-white/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-400" /> Repair History ({result.repairHistory?.length || 0})
                  </h4>
                  {result.repairHistory?.length > 0 ? (
                    <div className="space-y-3">
                      {result.repairHistory.map((r, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-white font-medium">{r.problemDescription}</p>
                            <span className={`text-xs font-semibold ${repairStatusColor(r.repairStatus)}`}>
                              {r.repairStatus?.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="flex gap-4 text-gray-400 text-xs">
                            <span>Job: {r.jobNumber}</span>
                            <span>By: {r.servicecenter?.shopName || r.servicecenter?.name || 'N/A'}</span>
                            <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                          {(r.finalBill > 0 || r.actualCost > 0) && (
                            <p className="text-green-400 text-xs mt-1">Bill: Rs. {(r.finalBill || r.actualCost || 0).toFixed(2)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No previous repairs</p>
                  )}
                </div>

                {/* Action Button */}
                {result.device?.status !== 'stolen' && (
                  <button
                    onClick={() => router.push(`/service/repairs/new?imei=${result.device?.imei}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Create Repair Job for this Device
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
