// src/pages/CalendarView.js
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarView() {
  const { leaveRequests, staff } = useApp();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  // Get all dates in current month
  const getDaysInMonth = (month, year) => {
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Empty cells before first day
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  };

  // Get leaves for a specific date
  const getLeavesForDate = (day) => {
    if (!day) return [];
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return leaveRequests.filter(r => {
      return dateStr >= r.fromDate && dateStr <= r.toDate;
    });
  };

  // Get substitute info for a date
  const getSubstitutesForDate = (day) => {
    if (!day) return [];
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const subs = [];
    leaveRequests.forEach(r => {
      if (dateStr >= r.fromDate && dateStr <= r.toDate) {
        r.substituteRequests?.forEach(sub => {
          if (sub.date === dateStr) subs.push(sub);
        });
      }
    });
    return subs;
  };

  const days = getDaysInMonth(currentMonth, currentYear);
  const selectedLeaves = selectedDate ? getLeavesForDate(selectedDate) : [];
  const selectedSubs = selectedDate ? getSubstitutesForDate(selectedDate) : [];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDate(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📅 Leave Calendar</h1>
        <p style={styles.subtitle}>View all leaves and substitutes by date</p>
      </div>

      <div style={styles.layout}>
        {/* Calendar */}
        <div style={styles.calendarCard}>
          {/* Month Navigation */}
          <div style={styles.monthNav}>
            <button style={styles.navBtn} onClick={prevMonth}>◀</button>
            <h2 style={styles.monthTitle}>{MONTHS[currentMonth]} {currentYear}</h2>
            <button style={styles.navBtn} onClick={nextMonth}>▶</button>
          </div>

          {/* Day Headers */}
          <div style={styles.weekHeader}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} style={styles.weekDay}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={styles.daysGrid}>
            {days.map((day, i) => {
              const leaves = getLeavesForDate(day);
              const hasLeave = leaves.length > 0;
              const hasPending = leaves.some(l => l.status === 'pending');
              const hasApproved = leaves.some(l => l.status === 'approved');
              const isToday = day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();
              const isSelected = selectedDate === day;

              return (
                <div
                  key={i}
                  style={{
                    ...styles.dayCell,
                    ...(day ? styles.dayCellActive : {}),
                    ...(isToday ? styles.today : {}),
                    ...(isSelected ? styles.selected : {}),
                    background: isSelected ? '#1e293b' :
                      isToday ? '#eff6ff' :
                      hasApproved ? '#dcfce7' :
                      hasPending ? '#fef9c3' : '#fff',
                  }}
                  onClick={() => day && setSelectedDate(isSelected ? null : day)}
                >
                  {day && (
                    <>
                      <span style={{
                        ...styles.dayNum,
                        color: isSelected ? '#fff' : isToday ? '#2563eb' : '#1e293b',
                      }}>
                        {day}
                      </span>
                      {hasLeave && (
                        <div style={styles.dotRow}>
                          {hasApproved && <span style={{ ...styles.dot, background: '#10b981' }} />}
                          {hasPending && <span style={{ ...styles.dot, background: '#f59e0b' }} />}
                        </div>
                      )}
                      {hasLeave && (
                        <div style={{
                          ...styles.leaveCount,
                          color: isSelected ? '#fff' : '#64748b',
                        }}>
                          {leaves.length} leave{leaves.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={styles.legend}>
            <div style={styles.legendItem}><span style={{ ...styles.dot, background: '#10b981' }} /> Approved</div>
            <div style={styles.legendItem}><span style={{ ...styles.dot, background: '#f59e0b' }} /> Pending</div>
            <div style={styles.legendItem}><span style={{ ...styles.todayDot }} /> Today</div>
          </div>
        </div>

        {/* Detail Panel */}
        <div style={styles.detailPanel}>
          {!selectedDate ? (
            <div style={styles.noSelection}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
              <div style={{ color: '#94a3b8', fontSize: 15 }}>Select a date to view details</div>
            </div>
          ) : (
            <>
              <h3 style={styles.detailTitle}>
                {String(selectedDate).padStart(2, '0')} {MONTHS[currentMonth]} {currentYear}
              </h3>

              {selectedLeaves.length === 0 ? (
                <div style={styles.noLeave}>✅ No leaves on this date</div>
              ) : (
                <>
                  <div style={styles.detailSection}>
                    <h4 style={styles.detailSectionTitle}>👨‍🏫 Faculty on Leave</h4>
                    {selectedLeaves.map((leave, i) => (
                      <div key={i} style={styles.leaveItem}>
                        <div style={styles.leaveAvatar}>{leave.teacherName?.[0]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={styles.leaveName}>{leave.teacherName}</div>
                          <div style={styles.leaveDate}>{leave.fromDate} → {leave.toDate}</div>
                          <div style={styles.leaveReason}>{leave.reason}</div>
                        </div>
                        <span style={{
                          ...styles.statusBadge,
                          background: leave.status === 'approved' ? '#d1fae5' : leave.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                          color: leave.status === 'approved' ? '#065f46' : leave.status === 'rejected' ? '#991b1b' : '#92400e',
                        }}>
                          {leave.status === 'approved' ? '✅' : leave.status === 'rejected' ? '❌' : '⏳'} {leave.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {selectedSubs.length > 0 && (
                    <div style={styles.detailSection}>
                      <h4 style={styles.detailSectionTitle}>🔄 Substitute Assignments</h4>
                      {selectedSubs.map((sub, i) => (
                        <div key={i} style={styles.subItem}>
                          <div style={styles.subPeriod}>P{sub.period}</div>
                          <div style={{ flex: 1 }}>
                            <div style={styles.subClass}>Class {sub.class} | {sub.time}</div>
                            {sub.subStatus === 'accepted' ? (
                              <div style={styles.subAccepted}>✅ {sub.acceptedByName}</div>
                            ) : (
                              <div style={styles.subWaiting}>⏳ Waiting for substitute</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 32, maxWidth: 1200, margin: '0 auto' },
  header: { marginBottom: 28 },
  title: { fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0 },
  subtitle: { color: '#64748b', marginTop: 6 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 },
  calendarCard: { background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 2px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' },
  monthNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  navBtn: { background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#374151' },
  monthTitle: { fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 },
  weekHeader: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 },
  weekDay: { textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#94a3b8', padding: '8px 0' },
  daysGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 },
  dayCell: { minHeight: 64, borderRadius: 10, padding: 8, border: '1px solid transparent', transition: 'all 0.15s' },
  dayCellActive: { cursor: 'pointer', border: '1px solid #f1f5f9' },
  today: { border: '2px solid #3b82f6 !important' },
  selected: { border: '2px solid #1e293b' },
  dayNum: { fontSize: 14, fontWeight: 700, display: 'block' },
  dotRow: { display: 'flex', gap: 3, marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: '50%', display: 'inline-block' },
  leaveCount: { fontSize: 10, marginTop: 2 },
  legend: { display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' },
  todayDot: { width: 12, height: 12, borderRadius: 3, background: '#eff6ff', border: '2px solid #3b82f6', display: 'inline-block' },
  detailPanel: { background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', height: 'fit-content' },
  noSelection: { textAlign: 'center', padding: '60px 20px' },
  detailTitle: { fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 20, marginTop: 0 },
  noLeave: { background: '#f0fdf4', color: '#166534', borderRadius: 10, padding: 16, textAlign: 'center', fontWeight: 600 },
  detailSection: { marginBottom: 20 },
  detailSectionTitle: { fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' },
  leaveItem: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px', background: '#f8fafc', borderRadius: 10, marginBottom: 8 },
  leaveAvatar: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #63b3ed, #9f7aea)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 },
  leaveName: { fontWeight: 700, fontSize: 14, color: '#1e293b' },
  leaveDate: { fontSize: 12, color: '#3b82f6', fontWeight: 600, marginTop: 2 },
  leaveReason: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statusBadge: { borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' },
  subItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px', background: '#f8fafc', borderRadius: 10, marginBottom: 8 },
  subPeriod: { width: 32, height: 32, borderRadius: 8, background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 },
  subClass: { fontSize: 13, fontWeight: 600, color: '#1e293b' },
  subAccepted: { fontSize: 12, color: '#166534', fontWeight: 600, marginTop: 2 },
  subWaiting: { fontSize: 12, color: '#f59e0b', fontWeight: 600, marginTop: 2 },
};