// src/pages/MyLeaves.js
import React from 'react';
import { useApp } from '../context/AppContext';

export default function MyLeaves({ setActivePage }) {
  const { leaveRequests, currentUser } = useApp();

  const myId = String(currentUser?._id || currentUser?.id || '');
  const isAdmin = currentUser.role === 'admin';

  // ✅ _id se match karo
  const myLeaves = isAdmin
    ? leaveRequests
    : leaveRequests.filter(r => String(r.teacherId?._id || r.teacherId) === myId);

  const sorted = [...myLeaves].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{isAdmin ? '📋 All Leave History' : '📋 My Leaves'}</h1>
          <p style={styles.subtitle}>{sorted.length} total request(s)</p>
        </div>
        {!isAdmin && (
          <button style={styles.applyBtn} onClick={() => setActivePage('Apply Leave')}>
            + Apply for Leave
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📭</div>
          <div style={styles.emptyText}>No leave requests yet</div>
        </div>
      ) : (
        <div style={styles.list}>
          {sorted.map(req => <LeaveCard key={req._id} req={req} />)}
        </div>
      )}
    </div>
  );
}

function LeaveCard({ req }) {
  const { currentUser, acceptSubstitute } = useApp();
  const [showSubs, setShowSubs] = React.useState(false);

  const myId = String(currentUser?._id || currentUser?.id || '');
  
  // ✅ _id se match karo
  const isLeaveOwner = String(req.teacherId?._id || req.teacherId) === myId;

  const statusMap = {
    pending: { bg: '#fef3c7', color: '#92400e', label: '⏳ Pending' },
    approved: { bg: '#d1fae5', color: '#065f46', label: '✅ Approved' },
    rejected: { bg: '#fee2e2', color: '#991b1b', label: '❌ Rejected' },
  };
  const s = statusMap[req.status] || statusMap.pending;

  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={styles.dateRange}>📅 {req.fromDate} → {req.toDate}</div>
            <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              {s.label}
            </span>
          </div>
          <div style={styles.reason}>📝 {req.reason}</div>
          {req.teacherName && !isLeaveOwner && (
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>👤 {req.teacherName}</div>
          )}
        </div>
        {req.substituteRequests?.length > 0 && (
          <button style={styles.expandBtn} onClick={() => setShowSubs(!showSubs)}>
            {showSubs ? '▲ Hide' : '▼ Substitutes'}
          </button>
        )}
      </div>

      {isLeaveOwner && req.substituteRequests?.length > 0 && (
        <div style={styles.subStatusBar}>
          {req.substituteRequests.filter(s => s.subStatus === 'accepted').length} / {req.substituteRequests.length} classes covered
        </div>
      )}

      {showSubs && (
        <div style={styles.subsSection}>
          {req.substituteRequests.map((sub, i) => {
            // ✅ String compare karo
            const isFreeTeacher = sub.freeTeachers?.some(t => String(t.id) === myId);
            const isAccepted = sub.subStatus === 'accepted';

            return (
              <div key={i} style={styles.subCard}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {sub.day} | Period {sub.period} | {sub.time} | Class {sub.class}
                </div>

                {isAccepted ? (
                  <div style={{ color: '#166534', fontWeight: 600, fontSize: 13 }}>
                    ✅ Accepted by {sub.acceptedByName}
                  </div>
                ) : isFreeTeacher && !isLeaveOwner ? (
                  <button
                    style={styles.acceptBtn}
                    onClick={() => acceptSubstitute(req._id, i, myId)} // ✅ _id
                  >
                    ✅ Accept Class
                  </button>
                ) : (
                  <div style={{ color: '#dc2626', fontSize: 13 }}>⚠ Waiting for substitute</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 30, maxWidth: 900, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 800, margin: 0 },
  subtitle: { color: '#64748b', marginTop: 4 },
  applyBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  empty: { textAlign: 'center', padding: 40 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: '#94a3b8' },
  list: { display: 'flex', flexDirection: 'column', gap: 15 },
  card: { background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  dateRange: { fontWeight: 700, color: '#1d4ed8' },
  reason: { color: '#64748b', fontSize: 13 },
  expandBtn: { background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '5px 12px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: 12 },
  subStatusBar: { marginTop: 10, background: '#f0fdf4', color: '#166534', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600 },
  subsSection: { marginTop: 15 },
  subCard: { border: '1px solid #e2e8f0', padding: 12, borderRadius: 8, marginBottom: 8 },
  acceptBtn: { background: '#16a34a', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', marginTop: 6, fontWeight: 600 },
};