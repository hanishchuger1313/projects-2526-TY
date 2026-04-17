'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { FileText, Download, TrendingUp, Wrench, Shield, DollarSign, Calendar, Filter } from 'lucide-react';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState('sales');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedShop, setSelectedShop] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('');

  const reportTypes = [
    { id: 'sales', label: 'Sales Report', icon: DollarSign, color: 'green' },
    { id: 'repairs', label: 'Repair Report', icon: Wrench, color: 'amber' },
    { id: 'warranty', label: 'Warranty Report', icon: Shield, color: 'blue' },
    { id: 'fraud', label: 'Fraud Report', icon: FileText, color: 'red' }
  ];

  useEffect(() => {
    if (reportType) {
      fetchReport();
    }
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/reports?type=${reportType}`;
      if (dateFrom) url += `&dateFrom=${dateFrom}`;
      if (dateTo) url += `&dateTo=${dateTo}`;
      if (selectedShop && reportType === 'sales') url += `&shopId=${selectedShop}`;
      if (selectedCenter && reportType === 'repairs') url += `&centerId=${selectedCenter}`;

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setReportData(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch report:', error);
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      let url = `/api/admin/reports?type=${reportType}&format=pdf`;
      if (dateFrom) url += `&dateFrom=${dateFrom}`;
      if (dateTo) url += `&dateTo=${dateTo}`;
      if (selectedShop && reportType === 'sales') url += `&shopId=${selectedShop}`;
      if (selectedCenter && reportType === 'repairs') url += `&centerId=${selectedCenter}`;

      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${reportType}-report-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download report');
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Reports & Analytics" breadcrumbs={['Admin', 'Reports']} />
        
        <div className="flex-1 overflow-auto p-6">
          {/* Report Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              const isActive = reportType === type.id;
              return (
                <motion.button
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setReportType(type.id)}
                  className={`p-6 rounded-xl border transition-all ${
                    isActive
                      ? `bg-${type.color}-500/20 border-${type.color}-500/30`
                      : 'glass border-white/10 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-3 ${isActive ? `text-${type.color}-400` : 'text-gray-400'}`} />
                  <p className={`font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {type.label}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 border border-white/10 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-bold text-white">Report Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Actions
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={fetchReport}
                    disabled={loading}
                    className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 font-medium"
                  >
                    {loading ? 'Loading...' : 'Generate Report'}
                  </button>
                  {reportData && (
                    <button
                      onClick={downloadPDF}
                      className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                      title="Download PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Report Content */}
          {loading ? (
            <div className="glass rounded-xl p-12 border border-white/10 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Generating report...</p>
            </div>
          ) : reportData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Sales Report */}
              {reportType === 'sales' && (
                <>
                  <div className="glass rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Sales Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="text-gray-400 text-sm">Total Sales</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {reportData.summary?.totalSales || 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="text-gray-400 text-sm">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-400 mt-1">
                          Rs. {(reportData.summary?.totalRevenue || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="text-gray-400 text-sm">Average Sale</p>
                        <p className="text-2xl font-bold text-blue-400 mt-1">
                          Rs. {(reportData.summary?.avgSaleValue || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="text-gray-400 text-sm">Min/Max Sale</p>
                        <p className="text-xl font-bold text-white mt-1">
                          Rs. {reportData.summary?.minSale || 0} / Rs. {reportData.summary?.maxSale || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {reportData.byShop && reportData.byShop.length > 0 && (
                    <div className="glass rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-4">Sales by Shop</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">Shop Name</th>
                              <th className="text-right py-3 px-4 text-gray-400 font-medium">Total Sales</th>
                              <th className="text-right py-3 px-4 text-gray-400 font-medium">Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.byShop.map((shop, index) => (
                              <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                <td className="py-3 px-4 text-white">{shop.shopName}</td>
                                <td className="py-3 px-4 text-right text-white font-semibold">
                                  {shop.totalSales}
                                </td>
                                <td className="py-3 px-4 text-right text-green-400 font-semibold">
                                  Rs. {(shop.totalRevenue || 0).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Repair Report */}
              {reportType === 'repairs' && (
                <>
                  <div className="glass rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Repair Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="text-gray-400 text-sm">Total Repairs</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {reportData.summary?.totalRepairs || 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="text-gray-400 text-sm">Completed</p>
                        <p className="text-2xl font-bold text-green-400 mt-1">
                          {reportData.summary?.completed || 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="text-gray-400 text-sm">In Progress</p>
                        <p className="text-2xl font-bold text-amber-400 mt-1">
                          {reportData.summary?.inProgress || 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="text-gray-400 text-sm">Pending</p>
                        <p className="text-2xl font-bold text-gray-400 mt-1">
                          {reportData.summary?.pending || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {reportData.byCenter && reportData.byCenter.length > 0 && (
                    <div className="glass rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-bold text-white mb-4">Repairs by Service Center</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-3 px-4 text-gray-400 font-medium">Center Name</th>
                              <th className="text-right py-3 px-4 text-gray-400 font-medium">Total</th>
                              <th className="text-right py-3 px-4 text-gray-400 font-medium">Completed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.byCenter.map((center, index) => (
                              <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                <td className="py-3 px-4 text-white">{center.centerName}</td>
                                <td className="py-3 px-4 text-right text-white font-semibold">
                                  {center.totalRepairs}
                                </td>
                                <td className="py-3 px-4 text-right text-green-400 font-semibold">
                                  {center.completed}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Warranty Report */}
              {reportType === 'warranty' && (
                <>
                  <div className="glass rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Warranty Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="text-gray-400 text-sm">Total Warranties</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {reportData.summary?.total || 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="text-gray-400 text-sm">Active</p>
                        <p className="text-2xl font-bold text-green-400 mt-1">
                          {reportData.summary?.active || 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="text-gray-400 text-sm">Expiring Soon</p>
                        <p className="text-2xl font-bold text-amber-400 mt-1">
                          {reportData.summary?.expiringSoon || 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/5">
                        <p className="text-gray-400 text-sm">Claimed</p>
                        <p className="text-2xl font-bold text-purple-400 mt-1">
                          {reportData.summary?.claimed || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Fraud Report */}
              {reportType === 'fraud' && (
                <div className="glass rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Fraud Detection Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-gray-400 text-sm">Risk Level</p>
                      <p className="text-2xl font-bold text-red-400 mt-1">
                        {reportData.summary?.riskLevel || 'LOW'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-gray-400 text-sm">Duplicate IMEIs</p>
                      <p className="text-2xl font-bold text-amber-400 mt-1">
                        {reportData.summary?.totalDuplicates || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-gray-400 text-sm">Blacklisted</p>
                      <p className="text-2xl font-bold text-red-400 mt-1">
                        {reportData.summary?.totalBlacklisted || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-gray-400 text-sm">Suspicious Shops</p>
                      <p className="text-2xl font-bold text-purple-400 mt-1">
                        {reportData.summary?.suspiciousShops || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass rounded-xl p-12 border border-white/10 text-center">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Click "Generate Report" to view data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
