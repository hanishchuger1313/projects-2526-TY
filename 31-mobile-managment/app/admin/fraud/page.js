'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { AlertTriangle, Shield, Copy, Eye, Ban } from 'lucide-react';

export default function AdminFraudPage() {
  const [fraudData, setFraudData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFraudData();
  }, []);

  const fetchFraudData = async () => {
    try {
      const response = await fetch('/api/admin/analytics?type=fraud');
      const data = await response.json();
      
      if (data.success) {
        setFraudData(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch fraud data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0A0F1E]">
        <Sidebar role="admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Loading fraud detection data...</div>
        </div>
      </div>
    );
  }

  const alerts = fraudData?.alerts || {};
  const riskLevel = fraudData?.summary?.riskLevel || 'LOW';
  const riskColors = {
    LOW: 'text-green-400 bg-green-500/20 border-green-500/30',
    MEDIUM: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    HIGH: 'text-red-400 bg-red-500/20 border-red-500/30'
  };

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Fraud Detection" breadcrumbs={['Admin', 'Fraud Detection']} />
        
        <div className="flex-1 overflow-auto p-6">
          {/* Alert Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${riskColors[riskLevel]}`}>
                  {riskLevel} RISK
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{alerts.total || 0}</p>
              <p className="text-sm text-gray-400">Total Alerts</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <Copy className="w-8 h-8 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white">{alerts.duplicates || 0}</p>
              <p className="text-sm text-gray-400">Duplicate IMEIs</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <Ban className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">{alerts.blacklisted || 0}</p>
              <p className="text-sm text-gray-400">Blacklisted Devices</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{alerts.suspicious || 0}</p>
              <p className="text-sm text-gray-400">Suspicious Activity</p>
            </motion.div>
          </div>

          {/* Duplicate IMEIs */}
          {fraudData?.duplicateIMEIs && fraudData.duplicateIMEIs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-xl p-6 border border-white/10 mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Copy className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Duplicate IMEI Detected</h3>
              </div>
              <div className="space-y-3">
                {fraudData.duplicateIMEIs.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm text-amber-400 font-mono">{item.imei}</code>
                      <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold">
                        {item.count} Duplicates
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      This IMEI has been registered {item.count} times across multiple shops
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Blacklisted Devices */}
          {fraudData?.blacklistedDevices && fraudData.blacklistedDevices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-xl p-6 border border-white/10 mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Ban className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-bold text-white">Blacklisted Devices</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">IMEI</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Reason</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fraudData.blacklistedDevices.map((device, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-all">
                        <td className="py-3 px-4">
                          <code className="text-sm text-red-400 bg-red-400/10 px-2 py-1 rounded">
                            {device.imei}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-sm">{device.reason}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {device.blacklistedAt ? new Date(device.blacklistedAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Suspicious Activity */}
          {fraudData?.suspiciousActivity && fraudData.suspiciousActivity.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Suspicious Activity Patterns</h3>
              </div>
              <div className="space-y-3">
                {fraudData.suspiciousActivity.map((activity, index) => (
                  <div key={index} className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{activity.shopName}</span>
                      <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-semibold">
                        {activity.deviceCount} devices
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Registered {activity.deviceCount} devices in {activity.period}
                    </p>
                    <div className="mt-2">
                      <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* No Fraud Detected */}
          {alerts.total === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-12 border border-white/10 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
              <p className="text-gray-400">No fraudulent activity detected at this time.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
