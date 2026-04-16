// src/pages/LeaveBalance.js
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TOTAL_YEARLY_LEAVE } from '../data/initialData';

export default function LeaveBalance() {
  const { currentUser, staff, leaveRequests } = useApp();
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const isAdmin = currentUser.role === 'admin';
  const staffToShow = isAdmin ? staff : staff.filter(t =>
    (t._id || t.id) === (currentUser._id || currentUser.id)
  );

  const getUsedDays = (teacherId) => {
    return leaveRequests
      .filter(r => {
        const tid = r.teacherId?._id || r.teacherId;
        return String(tid) === String(teacherId) && r.status === 'approved';
      })
      .reduce((sum, r) => {
        const days = Math.ceil(
          (new Date(r.toDate) - new Date(r.fromDate)) / (1000 * 60 * 60 * 24)
        ) + 1;
        return sum + days;
      }, 0);
  };

  const getLeaveHistory = (teacherId) => {
    return leaveRequests.filter(r => {
      const tid = r.teacherId?._id || r.teacherId;
      return String(tid) === String(teacherId);
    }).sort((a, b) => new Date(b.fromDate) - new Date(a.fromDate));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Leave Balance</h1>
        <p style={styles.subtitle}>
          {isAdmin ? 'All faculty leave balances' : 'Your remaining leave balance'}
        </p>
      </div>

      <div style={styles.grid}>
        {staffToShow.map(teacher => {
          const tid = teacher._id || teacher.id;
          const used = getUsedDays(tid);
          const remaining = Math.max(0, TOTAL_YEARLY_LEAVE - used);
          const percent = Math.round((remaining / TOTAL_YEARLY_LEAVE) * 100);
          const isLow = remaining <= 10;
          const isSelected = selectedTeacher === String(tid);

          return (
            <div
              key={tid}
              style={{
                ...styles.card,
                boxShadow: isSelected ? '0 0 0 2px #3b82f6' : '0 2px 20px rgba(0,0,0,0.06)',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedTeacher(isSelected ? null : String(tid))}
            >
              {/* Teacher Info */}
              <div style={styles.cardHeader}>
                <div style={styles.avatar}>{teacher.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={styles.teacherName}>{teacher.name}</div>
                  <div style={styles.dept}>{teacher.department} | {teacher.subject}</div>
                </div>
                <div style={styles.clickHint}>
                  {isSelected ? '▲ Hide' : '▼ History'}
                </div>
              </div>

              {/* Balance Display */}
              <div style={styles.balanceRow}>
                <div style={styles.balanceBox}>
                  <div style={styles.balanceNum}>{TOTAL_YEARLY_LEAVE}</div>
                  <div style={styles.balanceLbl}>Total</div>
                </div>
                <div style={styles.balanceBox}>
                  <div style={{ ...styles.balanceNum, color: '#ef4444' }}>{used}</div>
                  <div style={styles.balanceLbl}>Used</div>
                </div>
                <div style={styles.balanceBox}>
                  <div style={{ ...styles.balanceNum, color: isLow ? '#ef4444' : '#10b981' }}>
                    {remaining}
                  </div>
                  <div style={styles.balanceLbl}>Remaining</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={styles.progressBg}>
                <div style={{
                  ...styles.progressFill,
                  width: `${percent}%`,
                  background: isLow ? '#ef4444' : '#10b981',
                }} />
              </div>
              <div style={styles.progressLabel}>
                {percent}% remaining {isLow && <span style={{ color: '#ef4444' }}>⚠ Low!</span>}
              </div>

              {/* Leave History */}
              {isSelected && (
                <div style={styles.historySection}>
                  <h3 style={styles.historyTitle}>📋 Leave History</h3>
                  {getLeaveHistory(tid).length === 0 ? (
                    <div style={styles.noHistory}>No leaves taken yet</div>
                  ) : (
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          {['From', 'To', 'Days', 'Type', 'Status'].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {getLeaveHistory(tid).map((r, i) => {
                          const days = Math.ceil(
                            (new Date(r.toDate) - new Date(r.fromDate)) / (1000 * 60 * 60 * 24)
                          ) + 1;
                          const statusMap = {
                            approved: { bg: '#d1fae5', color: '#065f46', label: '✅ Approved' },
                            rejected: { bg: '#fee2e2', color: '#991b1b', label: '❌ Rejected' },
                            pending: { bg: '#fef3c7', color: '#92400e', label: '⏳ Pending' },
                          };
                          const s = statusMap[r.status] || statusMap.pending;
                          return (
                            <tr key={i} style={styles.tr}>
                              <td style={styles.td}>{r.fromDate}</td>
                              <td style={styles.td}>{r.toDate}</td>
                              <td style={styles.td}>
                                <span style={styles.daysBadge}>{days}d</span>
                              </td>
                              <td style={styles.td}>{r.leaveType || '—'}</td>
                              <td style={styles.td}>
                                <span style={{ ...styles.statusBadge, background: s.bg, color: s.color }}>
                                  {s.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 32, maxWidth: 1100, margin: '0 auto' },
  header: { marginBottom: 28 },
  title: { fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0 },
  subtitle: { color: '#64748b', marginTop: 6 },
  grid: { display: 'flex', flexDirection: 'column', gap: 20 },
  card: {
    background: '#fff', borderRadius: 20, padding: 28,
    border: '1px solid #f1f5f9', transition: 'all 0.2s',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatar: {
    width: 52, height: 52, borderRadius: '50%',
    background: 'linear-gradient(135deg, #63b3ed, #9f7aea)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800, fontSize: 22, flexShrink: 0,
  },
  teacherName: { fontWeight: 800, fontSize: 17, color: '#1e293b' },
  dept: { color: '#64748b', fontSize: 13, marginTop: 2 },
  clickHint: { fontSize: 12, color: '#94a3b8', fontWeight: 600 },
  balanceRow: { display: 'flex', gap: 16, marginBottom: 16 },
  balanceBox: {
    flex: 1, background: '#f8fafc', borderRadius: 12,
    padding: '16px', textAlign: 'center', border: '1px solid #e2e8f0',
  },
  balanceNum: { fontSize: 32, fontWeight: 800, color: '#1e293b', lineHeight: 1 },
  balanceLbl: { fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: 600 },
  progressBg: { height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 5, transition: 'width 0.5s ease' },
  progressLabel: { fontSize: 12, color: '#64748b', textAlign: 'right' },
  historySection: { marginTop: 20, borderTop: '2px solid #f1f5f9', paddingTop: 20 },
  historyTitle: { fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 14, marginTop: 0 },
  noHistory: { background: '#f8fafc', borderRadius: 10, padding: 20, textAlign: 'center', color: '#94a3b8' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#f8fafc', padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '10px 14px', fontSize: 13, color: '#374151' },
  daysBadge: { background: '#dbeafe', color: '#1d4ed8', borderRadius: 6, padding: '2px 8px', fontWeight: 700, fontSize: 12 },
  statusBadge: { borderRadius: 6, padding: '3px 10px', fontWeight: 700, fontSize: 11 },
};