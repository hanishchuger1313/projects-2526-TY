import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function LeaveRequests() {
  const { leaveRequests, updateLeaveStatus, acceptSubstitute, currentUser } = useApp();
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');

  const isAdmin = currentUser.role === 'admin';
  const myId = String(currentUser?._id || currentUser?.id || '');

  const filteredRequests = leaveRequests.filter(req => {
    if (isAdmin) return filter === 'all' || req.status === filter;
    if (currentUser.role === 'teacher') {
      const isMyLeave = String(req.teacherId?._id || req.teacherId) === myId;
      const isAssigned = req.substituteRequests?.some(sub =>
        sub.freeTeachers?.some(t => String(t.id) === myId)
      );
      return (isMyLeave || isAssigned) && (filter === 'all' || req.status === filter);
    }
    return false;
  });

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📋 Leave Requests</h1>

      <div style={styles.tabs}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ ...styles.tab, ...(filter === f ? styles.tabActive : {}) }}
          >
            {f === 'all' ? '📋 All' : f === 'pending' ? '⏳ Pending' : f === 'approved' ? '✅ Approved' : '❌ Rejected'}
            <span style={styles.count}>
              {leaveRequests.filter(r => f === 'all' || r.status === f).length}
            </span>
          </button>
        ))}
      </div>

      <div style={styles.list}>
        {filteredRequests.length === 0 && <div style={styles.empty}>No leave requests found</div>}
        {filteredRequests.map(req => (
          <div key={req._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.leftInfo}>
                <div style={styles.avatar}>{req.teacherName?.[0]}</div>
                <div>
                  <div style={styles.teacherName}>{req.teacherName}</div>
                  <div style={styles.dates}>📅 {req.fromDate} → {req.toDate}</div>
                  <div style={styles.reason}>📝 {req.reason}</div>
                  <div style={styles.meta}>
                    {req.substituteRequests?.length} class(es) affected
                  </div>
                </div>
              </div>

              <div style={styles.rightActions}>
                <StatusBadge status={req.status} />

                {/* ✅ Admin ke liye Approve/Reject */}
                {req.status === 'pending' && isAdmin && (
                  <div style={styles.actionBtns}>
                    <button style={styles.approveBtn} onClick={() => updateLeaveStatus(req._id, 'approved')}>
                      ✅ Approve
                    </button>
                    <button style={styles.rejectBtn} onClick={() => updateLeaveStatus(req._id, 'rejected')}>
                      ❌ Reject
                    </button>
                  </div>
                )}

                {req.substituteRequests?.length > 0 && (
                  <button style={styles.detailBtn} onClick={() => setExpanded(expanded === req._id ? null : req._id)}>
                    {expanded === req._id ? '▲ Hide' : '▼ Show'} Substitutes
                  </button>
                )}
              </div>
            </div>

            {expanded === req._id && (
              <div style={styles.subSection}>
                <h3 style={styles.subTitle}>🔄 Substitute Assignments</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['Date', 'Day', 'Period', 'Time', 'Class', 'Substitute'].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {req.substituteRequests.map((sub, idx) => (
                      <tr key={idx} style={styles.tr}>
                        <td style={styles.td}>{sub.date}</td>
                        <td style={styles.td}>{sub.day}</td>
                        <td style={styles.td}><span style={styles.periodBadge}>P{sub.period}</span></td>
                        <td style={styles.td}>{sub.time}</td>
                        <td style={styles.td}><strong>{sub.class}</strong></td>
                        <td style={styles.td}>
                          {sub.subStatus === 'accepted' ? (
                            <span style={styles.assigned}>✔ {sub.acceptedByName}</span>
                          ) : sub.freeTeachers?.some(t => String(t.id) === myId) ? (
                            <button style={styles.acceptBtn} onClick={() => acceptSubstitute(req._id, idx, myId)}>
                              ✅ Accept
                            </button>
                          ) : (
                            <span style={styles.waiting}>⏳ Waiting</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
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
    <span style={{ background: s.bg, color: s.color, padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

const styles = {
  container: { padding: 32, maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 24 },
  tabs: { display: 'flex', gap: 8, marginBottom: 24 },
  tab: { display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #e2e8f0', padding: '10px 20px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#64748b', transition: 'all 0.2s' },
  tabActive: { background: '#1e293b', color: '#fff', borderColor: '#1e293b' },
  count: { background: 'rgba(100,116,139,0.1)', borderRadius: 20, padding: '2px 8px', fontSize: 12 },
  list: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: { background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  leftInfo: { display: 'flex', gap: 16, alignItems: 'flex-start' },
  avatar: { width: 48, height: 48, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #63b3ed, #9f7aea)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 },
  teacherName: { fontWeight: 800, fontSize: 16, color: '#1e293b' },
  dates: { color: '#3b82f6', fontSize: 14, fontWeight: 600, marginTop: 4 },
  reason: { color: '#64748b', fontSize: 13, marginTop: 4 },
  meta: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  rightActions: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 },
  actionBtns: { display: 'flex', gap: 8 },
  approveBtn: { background: '#10b981', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  rejectBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  detailBtn: { background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '6px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13 },
  subSection: { marginTop: 20, borderTop: '1px solid #f1f5f9', paddingTop: 20 },
  subTitle: { fontWeight: 700, fontSize: 16, color: '#1e293b', marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#f8fafc', padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 14px', fontSize: 14, color: '#374151' },
  periodBadge: { background: '#dbeafe', color: '#1d4ed8', borderRadius: 8, padding: '3px 10px', fontWeight: 700, fontSize: 13 },
  acceptBtn: { background: '#16a34a', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  assigned: { color: '#16a34a', fontWeight: 600 },
  waiting: { color: '#f59e0b', fontWeight: 600 },
  empty: { background: '#f8fafc', borderRadius: 16, padding: 60, textAlign: 'center', color: '#94a3b8', fontSize: 15 },
};