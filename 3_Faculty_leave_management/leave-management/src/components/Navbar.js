import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Navbar({ activePage, setActivePage }) {
  const { notifications, markNotificationRead, currentUser, setCurrentUser, acceptSubstitute } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifState, setNotifState] = useState({});

  const isLoggedIn = currentUser && currentUser.name && currentUser.name !== '';

  // ✅ _id se match karo
  const myId = String(currentUser?._id || currentUser?.id || '');

  const unread = notifications.filter(n =>
    String(n.toTeacherId) === myId && !n.read
  ).length;

  const myNotifs = notifications.filter(n =>
    String(n.toTeacherId) === myId
  );

  const navItems = currentUser?.role === 'admin'
    ? ['Home', 'Dashboard', 'Leave Requests', 'Leave Balance', 'Calendar', 'Timetable', 'Staff']
    : currentUser?.role === 'teacher'
    ? ['Dashboard', 'Apply Leave', 'Leave Requests', 'My Leaves', 'Leave Balance', 'Calendar', 'Timetable']
    : ['Home', 'Dashboard', 'Leave Requests', 'Timetable', 'Staff'];

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setShowUserMenu(false);
    setActivePage('Home');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <span style={styles.brandIcon}>🎓</span>
        <div>
          <div style={styles.brandTitle}>LeaveSync</div>
          <div style={styles.brandSub}>College Faculty System</div>
        </div>
      </div>

      <div style={styles.navLinks}>
        {navItems.map(item => (
          <button
            key={item}
            onClick={() => !isLoggedIn ? setActivePage('Login') : setActivePage(item)}
            style={{ ...styles.navBtn, ...(activePage === item ? styles.navBtnActive : {}) }}
          >
            {item}
          </button>
        ))}
      </div>

      <div style={styles.navRight}>
        {isLoggedIn ? (
          <>
            <div style={{ position: 'relative' }}>
              <button style={styles.iconBtn} onClick={() => { setShowNotif(!showNotif); setShowUserMenu(false); }}>
                🔔
                {unread > 0 && <span style={styles.badge}>{unread}</span>}
              </button>
              {showNotif && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownTitle}>Notifications</div>
                  {myNotifs.length === 0 && <div style={styles.emptyNotif}>No notifications</div>}
                  {myNotifs.map(n => (
                    <div
                      key={n._id}  // ✅ _id use karo
                      style={{ ...styles.notifItem, background: n.read ? '#fff' : '#eef6ff' }}
                      onClick={() => markNotificationRead(n._id)}  // ✅ _id
                    >
                      <div style={styles.notifIcon}>
                        {n.type === 'substitute_request' ? '🔄' :
                          n.type === 'leave_approved' ? '✅' :
                            n.type === 'leave_rejected' ? '❌' :
                              n.type === 'substitute_accepted' ? '🙌' : '📋'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.notifMsg}>{n.message}</div>
                        <div style={styles.notifDate}>{n.date}</div>

                        {n.type === 'substitute_request' && (
                          <div style={{ marginTop: 8 }}>
                            {notifState[n._id] === 'accepted' && (
                              <div style={styles.acceptedTag}>✅ You accepted this class</div>
                            )}
                            {notifState[n._id] === 'rejected' && (
                              <div style={styles.rejectedTag}>❌ You rejected this</div>
                            )}
                            {!notifState[n._id] && (
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  style={styles.acceptBtn}
                                  onClick={e => {
                                    e.stopPropagation();
                                    acceptSubstitute(n.leaveRequestId, n.slotIndex, myId);
                                    markNotificationRead(n._id);
                                    setNotifState(prev => ({ ...prev, [n._id]: 'accepted' }));
                                  }}
                                >✅ Accept</button>
                                <button
                                  style={styles.rejectBtn}
                                  onClick={e => {
                                    e.stopPropagation();
                                    markNotificationRead(n._id);
                                    setNotifState(prev => ({ ...prev, [n._id]: 'rejected' }));
                                  }}
                                >❌ Reject</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button style={styles.userBtn} onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false); }}>
                <span style={styles.avatar}>{currentUser.name[0]}</span>
                <span style={styles.userName}>{currentUser.name}</span>
                <span style={styles.role}>{currentUser.role}</span>
              </button>
              {showUserMenu && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownTitle}>Account</div>
                  <div style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>
                    👤 {currentUser.name} ({currentUser.role})
                  </div>
                  <div style={{ ...styles.userItem, color: '#e53e3e', borderTop: '1px solid #f1f5f9' }} onClick={handleLogout}>
                    🚪 Logout
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <button style={styles.loginBtn} onClick={() => setActivePage('Login')}>
            🔐 Login
          </button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '0 24px', height: '64px', boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  brandIcon: { fontSize: 28 },
  brandTitle: { color: '#e2e8f0', fontSize: 18, fontWeight: 700, letterSpacing: 1 },
  brandSub: { color: '#94a3b8', fontSize: 11 },
  navLinks: { display: 'flex', gap: 4 },
  navBtn: {
    background: 'transparent', border: 'none', color: '#94a3b8',
    padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
    fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
  },
  navBtnActive: { background: 'rgba(99,179,237,0.15)', color: '#63b3ed' },
  navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  loginBtn: {
    background: 'rgba(99,179,237,0.15)', border: '1px solid rgba(99,179,237,0.4)',
    color: '#63b3ed', padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  iconBtn: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 18,
    color: '#e2e8f0', position: 'relative',
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    background: '#e53e3e', color: '#fff', borderRadius: '50%',
    width: 18, height: 18, fontSize: 11, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontWeight: 700,
  },
  userBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '6px 14px', cursor: 'pointer',
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg, #63b3ed, #9f7aea)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 14,
  },
  userName: { color: '#e2e8f0', fontSize: 13, fontWeight: 600 },
  role: {
    background: 'rgba(99,179,237,0.2)', color: '#63b3ed',
    borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600,
  },
  dropdown: {
    position: 'absolute', right: 0, top: '110%',
    background: '#fff', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    minWidth: 340, zIndex: 200, overflow: 'hidden',
    maxHeight: '480px',        // ✅ height limit
    overflowY: 'auto',         // ✅ sirf dropdown scroll
},
  dropdownTitle: {
    padding: '12px 16px', fontWeight: 700, fontSize: 13,
    color: '#64748b', borderBottom: '1px solid #f1f5f9', background: '#f8fafc',
  },
  emptyNotif: { padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 },
  notifItem: {
    display: 'flex', gap: 12, padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
  },
  notifIcon: { fontSize: 20, flexShrink: 0 },
  notifMsg: { fontSize: 13, color: '#374151', lineHeight: 1.4 },
  notifDate: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  acceptBtn: {
    background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0',
    borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  rejectBtn: {
    background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
    borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  acceptedTag: { fontSize: 11, color: '#166534', fontWeight: 600 },
  rejectedTag: { fontSize: 11, color: '#dc2626', fontWeight: 600 },
  userItem: {
    padding: '10px 16px', cursor: 'pointer', fontSize: 13,
    color: '#374151', borderBottom: '1px solid #f9fafb',
  },
};