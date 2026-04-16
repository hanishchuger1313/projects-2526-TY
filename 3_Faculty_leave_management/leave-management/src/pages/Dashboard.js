// src/pages/Dashboard.js
import React from 'react';
import { useApp } from '../context/AppContext';

export default function Dashboard({ setActivePage }) {
  const { leaveRequests, staff, notifications, currentUser } = useApp();

  const isAdmin = currentUser.role === 'admin';

  const stats = isAdmin ? [
    { label: 'Total Staff', value: staff.length, icon: '👥', color: '#3b82f6' },
    { label: 'Pending Leaves', value: leaveRequests.filter(r => r.status === 'pending').length, icon: '⏳', color: '#f59e0b' },
    { label: 'Approved', value: leaveRequests.filter(r => r.status === 'approved').length, icon: '✅', color: '#10b981' },
    { label: 'Rejected', value: leaveRequests.filter(r => r.status === 'rejected').length, icon: '❌', color: '#ef4444' },
  ] : [
    { label: 'My Leaves', value: leaveRequests.filter(r => r.teacherId === currentUser.id).length, icon: '📋', color: '#3b82f6' },
    { label: 'Pending', value: leaveRequests.filter(r => r.teacherId === currentUser.id && r.status === 'pending').length, icon: '⏳', color: '#f59e0b' },
    { label: 'Approved', value: leaveRequests.filter(r => r.teacherId === currentUser.id && r.status === 'approved').length, icon: '✅', color: '#10b981' },
    { label: 'Notifications', value: notifications.filter(n => n.toTeacherId === currentUser.id && !n.read).length, icon: '🔔', color: '#8b5cf6' },
  ];

  const recentLeaves = isAdmin
    ? leaveRequests.slice(-5).reverse()
    : leaveRequests.filter(r => r.teacherId === currentUser.id).slice(-5).reverse();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          {isAdmin ? '👑 Admin Dashboard' : `👋 Welcome, ${currentUser.name}`}
        </h1>
        <p style={styles.subtitle}>
          {isAdmin ? 'Manage all faculty leaves and substitutions' : 'Track your leave requests and notifications'}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {stats.map((s, i) => (
          <div key={i} style={styles.statCard}>
            <div style={styles.statIcon}>{s.icon}</div>
            <div style={styles.statValue} css={{ color: s.color }}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
            <div style={{ ...styles.statBar, background: s.color + '30' }}>
              <div style={{ ...styles.statBarFill, background: s.color, width: `${Math.min(s.value * 10, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionGrid}>
          {isAdmin ? (
            <>
              <ActionCard icon="📋" title="Review Leave Requests" desc="Approve or reject pending leaves" onClick={() => setActivePage('Leave Requests')} color="#3b82f6" />
              <ActionCard icon="📅" title="Manage Timetable" desc="Add or update staff schedules" onClick={() => setActivePage('Timetable')} color="#10b981" />
              <ActionCard icon="👥" title="Staff Directory" desc="View and manage all staff" onClick={() => setActivePage('Staff')} color="#8b5cf6" />
            </>
          ) : (
            <>
              <ActionCard icon="📝" title="Apply for Leave" desc="Submit a new leave request" onClick={() => setActivePage('Apply Leave')} color="#3b82f6" />
              <ActionCard icon="📋" title="My Leave History" desc="View all your leave requests" onClick={() => setActivePage('My Leaves')} color="#10b981" />
              <ActionCard icon="📅" title="My Timetable" desc="View your class schedule" onClick={() => setActivePage('Timetable')} color="#8b5cf6" />
            </>
          )}
        </div>
      </div>

      {/* Recent Leaves */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Leave Requests</h2>
        {recentLeaves.length === 0 ? (
          <div style={styles.empty}>No leave requests yet</div>
        ) : (
          <div style={styles.leaveList}>
            {recentLeaves.map(req => (
              <div key={req.id} style={styles.leaveCard} onClick={() => setActivePage('Leave Requests')}>    <div style={styles.leaveLeft}>
                  <div style={styles.leaveAvatar}>{req.teacherName[0]}</div>
                  <div>
                    <div style={styles.leaveName}>{req.teacherName}</div>
                    <div style={styles.leaveDates}>{req.fromDate} → {req.toDate}</div>
                    <div style={styles.leaveReason}>{req.reason}</div>
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc, onClick, color }) {
  return (
    <div style={{ ...styles.actionCard, borderTop: `4px solid ${color}` }} onClick={onClick}>
      <div style={{ ...styles.actionIcon, background: color + '15', color }}>{icon}</div>
      <div style={styles.actionTitle}>{title}</div>
      <div style={styles.actionDesc}>{desc}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { bg: '#fef3c7', color: '#92400e', label: '⏳ Pending' },
    approved: { bg: '#d1fae5', color: '#065f46', label: '✅ Approved' },
    rejected: { bg: '#fee2e2', color: '#991b1b', label: '❌ Rejected' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

const styles = {
  container: { padding: 32, maxWidth: 1200, margin: '0 auto' },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0 },
  subtitle: { color: '#64748b', marginTop: 6, fontSize: 15 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 },
  statCard: {
    background: '#fff', borderRadius: 16, padding: 24,
    boxShadow: '0 2px 20px rgba(0,0,0,0.06)', textAlign: 'center',
    border: '1px solid #f1f5f9',
  },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 36, fontWeight: 800, color: '#1e293b', lineHeight: 1 },
  statLabel: { color: '#64748b', fontSize: 13, marginTop: 4, marginBottom: 12 },
  statBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: 3, transition: 'width 1s ease' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 16 },
  actionGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  actionCard: {
    background: '#fff', borderRadius: 16, padding: 24, cursor: 'pointer',
    boxShadow: '0 2px 20px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #f1f5f9',
  },
  actionIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 12 },
  actionTitle: { fontWeight: 700, fontSize: 16, color: '#1e293b', marginBottom: 4 },
  actionDesc: { color: '#64748b', fontSize: 13 },
  leaveList: { display: 'flex', flexDirection: 'column', gap: 12 },
  leaveCard: {
    background: '#fff', borderRadius: 14, padding: '16px 20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
    border: '1px solid #f1f5f9',
    cursor: 'pointer',
  },
  leaveLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  leaveAvatar: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'linear-gradient(135deg, #63b3ed, #9f7aea)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0,
  },
  leaveName: { fontWeight: 700, color: '#1e293b', fontSize: 15 },
  leaveDates: { color: '#3b82f6', fontSize: 13, fontWeight: 600, marginTop: 2 },
  leaveReason: { color: '#64748b', fontSize: 12, marginTop: 2 },
  empty: { background: '#f8fafc', borderRadius: 12, padding: 40, textAlign: 'center', color: '#94a3b8' },
};
