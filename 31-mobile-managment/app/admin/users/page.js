'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Users, CheckCircle, XCircle, Ban, Trash2, Clock, Filter } from 'lucide-react';
import { ROLE_COLORS, STATUS_COLORS } from '@/lib/constants';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, active, blocked
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (filter !== 'all') {
      filtered = filtered.filter(u => u.status === filter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleApprove = async (userId) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: 'active', action: 'approved' })
      });

      if (response.ok) {
        fetchUsers();
        alert('User approved successfully!');
      }
    } catch (error) {
      console.error('Failed to approve user:', error);
      alert('Failed to approve user');
    }
  };

  const handleBlock = async (userId) => {
    if (!confirm('Are you sure you want to block this user?')) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: 'blocked', action: 'blocked' })
      });

      if (response.ok) {
        fetchUsers();
        alert('User blocked successfully!');
      }
    } catch (error) {
      console.error('Failed to block user:', error);
      alert('Failed to block user');
    }
  };

  const handleReject = async (userId) => {
    if (!confirm('Are you sure you want to reject this user?')) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: 'rejected', action: 'rejected' })
      });

      if (response.ok) {
        fetchUsers();
        alert('User rejected successfully!');
      }
    } catch (error) {
      console.error('Failed to reject user:', error);
      alert('Failed to reject user');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchUsers();
        alert('User deleted successfully!');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const pendingCount = users.filter(u => u.status === 'pending').length;

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="User Management" breadcrumbs={['Admin', 'Users']} />
        
        <div className="flex-1 overflow-auto p-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white mt-1">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Approval</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Blocked Users</p>
                  <p className="text-2xl font-bold text-red-400 mt-1">
                    {users.filter(u => u.status === 'blocked').length}
                  </p>
                </div>
                <Ban className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="glass rounded-xl p-4 border border-white/10 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm">Filters:</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'pending'
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'active'
                      ? 'bg-green-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter('blocked')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'blocked'
                      ? 'bg-red-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Blocked
                </button>
              </div>

              <div className="h-6 w-px bg-white/10"></div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="shop">Shop Owner</option>
                <option value="service">Service Center</option>
                <option value="customer">Customer</option>
                <option value="technician">Technician</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">User</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Contact</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Role</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Registered</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-400">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            {user.shopName && (
                              <p className="text-gray-400 text-xs">Shop: {user.shopName}</p>
                            )}
                            {user.centerName && (
                              <p className="text-gray-400 text-xs">Center: {user.centerName}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-gray-300 text-sm">{user.email}</p>
                          <p className="text-gray-400 text-xs">{user.phone}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${ROLE_COLORS[user.role]}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${STATUS_COLORS[user.status] || 'bg-gray-500/20 border-gray-500/30 text-gray-400'}`}>
                            {user.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-300 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            {user.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(user.id)}
                                  className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(user.id)}
                                  className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {user.status === 'active' && user.role !== 'admin' && (
                              <button
                                onClick={() => handleBlock(user.id)}
                                className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-all"
                                title="Block"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                            {user.status === 'blocked' && (
                              <button
                                onClick={() => handleApprove(user.id)}
                                className="p-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all"
                                title="Unblock"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
