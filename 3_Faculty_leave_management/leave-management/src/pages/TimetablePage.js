import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DAYS, PERIOD_TIMES } from '../data/initialData';

export default function TimetablePage() {
  const { timetable, staff, addTimetableEntry, removeTimetableEntry, currentUser } = useApp();

  const isAdmin = currentUser.role === 'admin';

  const [selectedStaff, setSelectedStaff] = useState(
    currentUser.role !== 'admin'
      ? (currentUser._id || currentUser.id)
      : (staff[0]?._id || staff[0]?.id || '')
  );

  const [newEntry, setNewEntry] = useState({ day: 'Monday', period: 1, class: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const displayStaffId = isAdmin
    ? selectedStaff
    : (currentUser._id || currentUser.id);

const teacherIndex = staff.findIndex(s => (s._id || s.id) === displayStaffId) + 1;
const slots = timetable[teacherIndex] || [];
  const selectedStaffMember = staff.find(
    s => (s._id || s.id) === displayStaffId
  );

  const handleAdd = () => {
    if (!newEntry.class.trim()) { alert('Please enter class name'); return; }

    addTimetableEntry(displayStaffId, {
      ...newEntry,
      period: Number(newEntry.period),
      time: PERIOD_TIMES[newEntry.period]
    });

    setNewEntry({ day: 'Monday', period: 1, class: '' });
    setShowAdd(false);
  };

  const gridData = {};
  DAYS.forEach(day => {
    gridData[day] = {};
    [1, 2, 3, 4].forEach(p => { gridData[day][p] = null; });
  });

  slots.forEach((slot, idx) => {
    if (gridData[slot.day]) {
      gridData[slot.day][slot.period] = { ...slot, idx };
    }
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📅 Timetable</h1>
          <p style={styles.subtitle}>Manage faculty class schedules</p>
        </div>
        {isAdmin && (
          <button style={styles.addBtn} onClick={() => setShowAdd(!showAdd)}>
            + Add Period
          </button>
        )}
      </div>

      {isAdmin && (
        <div style={styles.staffBar}>
          {staff.map(t => {

            const id = t._id || t.id;

            return (
              <button
                key={id}
                onClick={() => { setSelectedStaff(id); setShowAdd(false); }}
                style={{
                  ...styles.staffChip,
                  ...(displayStaffId === id ? styles.staffChipActive : {}),
                }}
              >
                <span style={styles.chipAvatar}>{t.name[0]}</span>
                {t.name.split(' ')[1]}
              </button>
            );

          })}
        </div>
      )}

      {selectedStaffMember && (
        <div style={styles.staffInfo}>
          <div style={styles.infoAvatar}>{selectedStaffMember.name[0]}</div>
          <div>
            <div style={styles.infoName}>{selectedStaffMember.name}</div>
            <div style={styles.infoSub}>
              {selectedStaffMember.subject} · {selectedStaffMember.department}
            </div>
          </div>
          <div style={styles.slotCount}>{slots.length} periods/week</div>
        </div>
      )}

      {showAdd && isAdmin && (
        <div style={styles.addForm}>
          <h3 style={styles.addTitle}>Add New Period</h3>
          <div style={styles.addRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Day</label>
              <select
                style={styles.select}
                value={newEntry.day}
                onChange={e => setNewEntry({ ...newEntry, day: e.target.value })}
              >
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Period</label>
              <select
                style={styles.select}
                value={newEntry.period}
                onChange={e => setNewEntry({ ...newEntry, period: e.target.value })}
              >
                {[1,2,3,4].map(p => (
                  <option key={p} value={p}>
                    Period {p} ({PERIOD_TIMES[p]})
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Class</label>
              <input
                style={styles.input}
                placeholder="e.g. 11A"
                value={newEntry.class}
                onChange={e => setNewEntry({ ...newEntry, class: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>&nbsp;</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={styles.saveBtn} onClick={handleAdd}>Save</button>
                <button style={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={styles.gridWrapper}>
        <table style={styles.grid}>
          <thead>
            <tr>
              <th style={styles.cornerCell}>Day / Period</th>
              {[1,2,3,4].map(p => (
                <th key={p} style={styles.headCell}>
                  <div>Period {p}</div>
                  <div style={styles.periodTime}>{PERIOD_TIMES[p]}</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {DAYS.map(day => (
              <tr key={day}>
                <td style={styles.dayCell}>{day}</td>

                {[1,2,3,4].map(p => {

                  const slot = gridData[day]?.[p];

                  return (
                    <td key={p} style={styles.slotCell}>

                      {slot ? (

                        <div style={styles.slotBox}>

                          <div style={styles.slotClass}>
                            Class {slot.class}
                          </div>

                          {isAdmin && (
                            <button
                              style={styles.removeBtn}
                              onClick={() => removeTimetableEntry(displayStaffId, slot.idx)}
                            >
                              ✕
                            </button>
                          )}

                        </div>

                      ) : (
                        <div style={styles.emptySlot}>—</div>
                      )}

                    </td>
                  );

                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statChip}>📊 Total: {slots.length} periods/week</div>
        <div style={styles.statChip}>
          📚 Classes: {[...new Set(slots.map(s => s.class))].join(', ') || 'None'}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 32, maxWidth: 1100, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0 },
  subtitle: { color: '#64748b', marginTop: 6, fontSize: 15 },
  addBtn: {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff',
    border: 'none', padding: '12px 24px', borderRadius: 12,
    cursor: 'pointer', fontSize: 14, fontWeight: 700,
  },
  staffBar: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  staffChip: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fff', border: '1.5px solid #e2e8f0',
    padding: '8px 16px', borderRadius: 40, cursor: 'pointer',
    fontSize: 13, fontWeight: 600, color: '#64748b', transition: 'all 0.2s',
  },
  staffChipActive: { background: '#1e293b', color: '#fff', borderColor: '#1e293b' },
  chipAvatar: {
    width: 24, height: 24, borderRadius: '50%',
    background: 'linear-gradient(135deg, #63b3ed, #9f7aea)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 12, fontWeight: 700,
  },
  staffInfo: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: '#fff', borderRadius: 14, padding: '14px 20px',
    marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9',
  },
  infoAvatar: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'linear-gradient(135deg, #63b3ed, #9f7aea)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 18,
  },
  infoName: { fontWeight: 700, color: '#1e293b', fontSize: 16 },
  infoSub: { color: '#64748b', fontSize: 13 },
  slotCount: {
    marginLeft: 'auto', background: '#dbeafe', color: '#1d4ed8',
    borderRadius: 20, padding: '6px 16px', fontSize: 14, fontWeight: 700,
  },
  addForm: {
    background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20,
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
  },
  addTitle: { fontWeight: 700, color: '#1e293b', marginBottom: 16, fontSize: 16 },
  addRow: { display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: 16, alignItems: 'end' },
  formGroup: {},
  label: { display: 'block', fontWeight: 600, color: '#374151', marginBottom: 6, fontSize: 13 },
  select: {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', fontSize: 14, color: '#1e293b',
  },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', fontSize: 14, color: '#1e293b',
    boxSizing: 'border-box',
  },
  saveBtn: {
    background: '#10b981', color: '#fff', border: 'none',
    padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
  },
  cancelBtn: {
    background: '#f1f5f9', color: '#64748b', border: 'none',
    padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600,
  },
  gridWrapper: { overflowX: 'auto', borderRadius: 16, boxShadow: '0 2px 20px rgba(0,0,0,0.06)', marginBottom: 16 },
  grid: { width: '100%', borderCollapse: 'collapse', background: '#fff' },
  cornerCell: {
    padding: '14px 20px', background: '#1e293b', color: '#94a3b8',
    fontSize: 13, fontWeight: 700, textAlign: 'left',
  },
  headCell: {
    padding: '14px 20px', background: '#1e293b', color: '#e2e8f0',
    fontSize: 14, fontWeight: 700, textAlign: 'center', minWidth: 160,
  },
  periodTime: { color: '#63b3ed', fontSize: 12, fontWeight: 400, marginTop: 2 },
  dayCell: {
    padding: '14px 20px', fontWeight: 700, color: '#374151',
    background: '#f8fafc', fontSize: 14, borderBottom: '1px solid #e2e8f0',
  },
  slotCell: {
    padding: 10, textAlign: 'center',
    borderBottom: '1px solid #f1f5f9', borderLeft: '1px solid #f1f5f9',
  },
  slotBox: {
    background: 'linear-gradient(135deg, #dbeafe, #ede9fe)',
    borderRadius: 10, padding: '10px 14px', position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  slotClass: { fontWeight: 700, color: '#1d4ed8', fontSize: 15 },
  removeBtn: {
    position: 'absolute', top: 4, right: 4,
    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
    border: 'none', borderRadius: 6, padding: '2px 6px',
    cursor: 'pointer', fontSize: 12, fontWeight: 700,
  },
  emptySlot: { color: '#d1d5db', fontSize: 18 },
  statsRow: { display: 'flex', gap: 12 },
  statChip: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20,
    padding: '8px 16px', fontSize: 13, color: '#374151', fontWeight: 500,
  },
};
