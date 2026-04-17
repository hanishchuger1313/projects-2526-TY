'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiSearch, FiTool, FiPackage, FiDollarSign,
  FiClock, FiCheckCircle, FiAlertCircle, FiTrendingUp,
  FiUsers, FiFileText
} from 'react-icons/fi';

export default function ServiceCenterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentRepairs, setRecentRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (session?.user?.role !== 'servicecenter' && status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [session, status]);

  useEffect(() => {
    if (session?.user?.id) fetchDashboardData();
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`/api/servicecenter/dashboard?servicecenterId=${session.user.id}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentRepairs(data.recentRepairs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'waiting-parts': 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
    };
    return map[s] || 'bg-gray-100 text-gray-600';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Service Center Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome, {session?.user?.name}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/servicecenter/search"
          className="flex flex-col items-center p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
          <FiSearch className="text-2xl mb-2" />
          <span className="font-medium text-sm">Search Device</span>
        </Link>
        <Link href="/dashboard/servicecenter/repairs/new"
          className="flex flex-col items-center p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
          <FiTool className="text-2xl mb-2" />
          <span className="font-medium text-sm">New Repair</span>
        </Link>
        <Link href="/dashboard/servicecenter/repairs"
          className="flex flex-col items-center p-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition">
          <FiFileText className="text-2xl mb-2" />
          <span className="font-medium text-sm">All Repairs</span>
        </Link>
        <Link href="/dashboard/servicecenter/billing"
          className="flex flex-col items-center p-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition">
          <FiDollarSign className="text-2xl mb-2" />
          <span className="font-medium text-sm">Billing</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Repairs', value: stats?.total || 0, icon: FiTool, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending', value: stats?.pending || 0, icon: FiClock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'In Progress', value: stats?.inProgress || 0, icon: FiAlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Completed', value: stats?.completed || 0, icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
              <div className={`${s.bg} p-3 rounded-lg`}>
                <s.icon className={`text-xl ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <FiTrendingUp className="text-green-600 text-xl" />
            <h3 className="font-semibold text-gray-900">Revenue Overview</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Revenue</span>
              <span className="font-bold text-green-600">Rs. {stats?.totalRevenue?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">This Month</span>
              <span className="font-semibold text-gray-900">Rs. {stats?.monthlyRevenue?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Warranty Claims</span>
              <span className="font-semibold text-blue-600">{stats?.warrantyClaims || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <FiPackage className="text-purple-600 text-xl" />
            <h3 className="font-semibold text-gray-900">Repair Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Waiting for Parts</span>
              <span className="font-semibold text-orange-600">{stats?.waitingParts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ready for Delivery</span>
              <span className="font-semibold text-green-600">{stats?.readyDelivery || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivered Today</span>
              <span className="font-semibold text-gray-900">{stats?.deliveredToday || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Repairs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Repairs</h3>
          <Link href="/dashboard/servicecenter/repairs" className="text-blue-600 text-sm hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentRepairs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <FiTool className="text-4xl mx-auto mb-2 opacity-30" />
              <p>No repairs yet</p>
            </div>
          ) : (
            recentRepairs.map((repair) => (
              <Link key={repair.id} href={`/dashboard/servicecenter/repairs/${repair.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                <div>
                  <p className="font-medium text-gray-900">{repair.device?.brand} {repair.device?.model}</p>
                  <p className="text-sm text-gray-500">IMEI: {repair.imei} • {repair.jobNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Rs. {repair.finalBill?.toLocaleString() || 0}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(repair.repairStatus)}`}>
                    {repair.repairStatus}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
