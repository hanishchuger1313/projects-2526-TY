// src/pages/StaffPage.js
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function StaffPage() {
  const { staff, addStaffMember, timetable } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', department: '', email: '' });
  const [search, setSearch] = useState('');

  const departments = [...new Set(staff.map(s => s.department))];

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.subject.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name || !form.subject || !form.department || !form.email) {
      alert('Please fill all fields');
      return;
    }
    addStaffMember(form);
    setForm({ name: '', subject: '', department: '', email: '' });
    setShowForm(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👥 Staff Directory</h1>
          <p style={styles.subtitle}>{staff.length} faculty members</p>
        </div>
        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          + Add Staff
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>Add New Staff Member</h3>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name *</label>
              <input style={styles.input} placeholder="Prof. First Last" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Subject *</label>
              <input style={styles.input} placeholder="e.g. Mathematics" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Department *</label>
              <input style={styles.input} placeholder="e.g. Science" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input style={styles.input} placeholder="email@college.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div style={styles.formActions}>
            <button style={styles.saveBtn} onClick={handleAdd}>Add Staff Member</button>
            <button style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={styles.searchBar}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          style={styles.searchInput}
          placeholder="Search by name, subject or department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Department Filter */}
      <div style={styles.deptBar}>
        {departments.map(dept => (
          <span key={dept} style={styles.deptChip}>{dept} ({staff.filter(s => s.department === dept).length})</span>
        ))}
      </div>

      {/* Staff Grid */}
      <div style={styles.grid}>
        {filtered.map(member => {
          const slots = timetable[member.id] || [];
          return (
            <div key={member.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.avatar}>{member.name[0]}</div>
                <div style={styles.deptTag}>{member.department}</div>
              </div>
              <div style={styles.name}>{member.name}</div>
              <div style={styles.subject}>📚 {member.subject}</div>
              <div style={styles.email}>✉️ {member.email}</div>
              <div style={styles.divider} />
              <div style={styles.stats}>
                <div style={styles.stat}>
                  <div style={styles.statVal}>{slots.length}</div>
                  <div style={styles.statLabel}>Periods/week</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statVal}>{[...new Set(slots.map(s => s.class))].length}</div>
                  <div style={styles.statLabel}>Classes</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statVal}>{[...new Set(slots.map(s => s.day))].length}</div>
                  <div style={styles.statLabel}>Active Days</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 32, maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0 },
  subtitle: { color: '#64748b', marginTop: 6, fontSize: 15 },
  addBtn: {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff',
    border: 'none', padding: '12px 24px', borderRadius: 12,
    cursor: 'pointer', fontSize: 14, fontWeight: 700,
  },
  form: {
    background: '#fff', borderRadius: 20, padding: 28, marginBottom: 24,
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0',
  },
  formTitle: { fontWeight: 700, color: '#1e293b', marginBottom: 20, fontSize: 17 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  formGroup: {},
  label: { display: 'block', fontWeight: 600, color: '#374151', marginBottom: 6, fontSize: 13 },
  input: {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', fontSize: 14, color: '#1e293b',
    boxSizing: 'border-box',
  },
  formActions: { display: 'flex', gap: 10 },
  saveBtn: {
    background: '#10b981', color: '#fff', border: 'none',
    padding: '12px 28px', borderRadius: 12, cursor: 'pointer',
    fontWeight: 700, fontSize: 14,
  },
  cancelBtn: {
    background: '#f1f5f9', color: '#64748b', border: 'none',
    padding: '12px 20px', borderRadius: 12, cursor: 'pointer',
    fontWeight: 600, fontSize: 14,
  },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#fff', borderRadius: 12, padding: '12px 16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16,
    border: '1px solid #f1f5f9',
  },
  searchIcon: { fontSize: 18 },
  searchInput: {
    border: 'none', outline: 'none', fontSize: 14, color: '#374151',
    flex: 1, background: 'transparent',
  },
  deptBar: { display: 'flex', gap: 8, marginBottom: 24 },
  deptChip: {
    background: '#f1f5f9', color: '#64748b', borderRadius: 20,
    padding: '6px 14px', fontSize: 13, fontWeight: 600,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  card: {
    background: '#fff', borderRadius: 20, padding: 24,
    boxShadow: '0 2px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  avatar: {
    width: 52, height: 52, borderRadius: '50%',
    background: 'linear-gradient(135deg, #63b3ed, #9f7aea)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 800, fontSize: 22,
  },
  deptTag: {
    background: '#ede9fe', color: '#7c3aed', borderRadius: 20,
    padding: '4px 12px', fontSize: 12, fontWeight: 600,
  },
  name: { fontWeight: 800, color: '#1e293b', fontSize: 16, marginBottom: 6 },
  subject: { color: '#3b82f6', fontSize: 14, fontWeight: 600, marginBottom: 4 },
  email: { color: '#94a3b8', fontSize: 13, marginBottom: 16 },
  divider: { height: 1, background: '#f1f5f9', marginBottom: 16 },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  stat: { textAlign: 'center', background: '#f8fafc', borderRadius: 10, padding: '10px 6px' },
  statVal: { fontSize: 20, fontWeight: 800, color: '#1e293b' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
};
