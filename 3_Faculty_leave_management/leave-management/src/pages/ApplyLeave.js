// src/pages/ApplyLeave.js
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const DEPARTMENTS = [
  'Computer Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Electronics & Telecommunication',
  'Information Technology',
];

const LEAVE_TYPES = [
  { value: 'medical', label: '🏥 Medical Leave' },
  { value: 'casual', label: '🌴 Casual Leave' },
  { value: 'duty', label: '📋 Duty Leave' },
  { value: 'personal', label: '👤 Personal Leave' },
];

export default function ApplyLeave({ setActivePage }) {
  const { applyLeave, getTeacherSlots, currentUser } = useApp();

  const [form, setForm] = useState({
    facultyName: currentUser?.name || '',
    department: '',
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: '',
  });
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handlePreview = () => {
    if (!form.facultyName || !form.department || !form.leaveType || !form.fromDate || !form.toDate || !form.reason) {
      alert('Please fill all fields');
      return;
    }
    // ✅ timetableId use karo
    const slots = getTeacherSlots(
      currentUser.timetableId || currentUser.id,
      form.fromDate,
      form.toDate
    );
    setPreview(slots);
  };

  const handleSubmit = () => {
    // ✅ timetableId use karo
    applyLeave(
      currentUser.timetableId || currentUser.id,
      form.fromDate,
      form.toDate,
      `[${LEAVE_TYPES.find(l => l.value === form.leaveType)?.label}] ${form.reason}`,
      {
        facultyName: form.facultyName,
        department: form.department,
        leaveType: form.leaveType,
      }
    );
    setSubmitted(true);
    setTimeout(() => setActivePage('My Leaves'), 2000);
  };

  if (submitted) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.successBox}>
          <div style={styles.successIcon}>🎉</div>
          <h2 style={styles.successTitle}>Leave Request Submitted!</h2>
          <p style={styles.successMsg}>
            Your leave request has been submitted successfully. Free staff have been notified for substitute requests.
          </p>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Redirecting to My Leaves...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.headerBanner}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>📝 Apply for Leave</h1>
          <p style={styles.subtitle}>Fill in the details below to submit your leave request</p>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionDot} />
            <span style={styles.sectionTitle}>Faculty & Leave Details</span>
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Faculty Name <span style={styles.required}>*</span></label>
              <input
                type="text"
                style={styles.input}
                placeholder="Enter your full name..."
                value={form.facultyName}
                onChange={e => setForm({ ...form, facultyName: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Department <span style={styles.required}>*</span></label>
              <select
                style={styles.select}
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              >
                <option value="">-- Select Department --</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Leave Type <span style={styles.required}>*</span></label>
            <div style={styles.leaveTypeGrid}>
              {LEAVE_TYPES.map(lt => (
                <div
                  key={lt.value}
                  style={{
                    ...styles.leaveTypeCard,
                    ...(form.leaveType === lt.value ? styles.leaveTypeCardActive : {}),
                  }}
                  onClick={() => setForm({ ...form, leaveType: lt.value })}
                >
                  {lt.label}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>From Date <span style={styles.required}>*</span></label>
              <input
                type="date"
                style={styles.input}
                value={form.fromDate}
                onChange={e => { setForm({ ...form, fromDate: e.target.value }); setPreview(null); }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>To Date <span style={styles.required}>*</span></label>
              <input
                type="date"
                style={styles.input}
                value={form.toDate}
                onChange={e => { setForm({ ...form, toDate: e.target.value }); setPreview(null); }}
                min={form.fromDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Reason for Leave <span style={styles.required}>*</span></label>
            <textarea
              style={styles.textarea}
              rows={3}
              placeholder="Enter reason for leave..."
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
            />
          </div>

          <button style={styles.previewBtn} onClick={handlePreview}>
            🔍 Preview Affected Classes & Substitutes
          </button>
        </div>

        {preview && (
          <div style={styles.previewSection}>
            <div style={styles.summaryBox}>
              <h3 style={styles.summaryTitle}>📄 Leave Request Summary</h3>
              <div style={styles.summaryGrid}>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryKey}>Faculty Name</span>
                  <span style={styles.summaryVal}>{form.facultyName}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryKey}>Department</span>
                  <span style={styles.summaryVal}>{form.department}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryKey}>Leave Type</span>
                  <span style={styles.summaryVal}>{LEAVE_TYPES.find(l => l.value === form.leaveType)?.label}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryKey}>Duration</span>
                  <span style={styles.summaryVal}>{form.fromDate} → {form.toDate}</span>
                </div>
                <div style={{ ...styles.summaryItem, gridColumn: '1 / -1' }}>
                  <span style={styles.summaryKey}>Reason</span>
                  <span style={styles.summaryVal}>{form.reason}</span>
                </div>
              </div>
            </div>

            <h2 style={styles.previewTitle}>
              {preview.length === 0 ? '✅ No Classes Affected' : `📋 ${preview.length} Classes Affected`}
            </h2>

            {preview.length > 0 && (
              <div style={styles.slotGrid}>
                {preview.map((slot, i) => (
                  <div key={i} style={styles.slotCard}>
                    <div style={styles.slotHeader}>
                      <span style={styles.slotDay}>{slot.day}, {slot.date}</span>
                      <span style={styles.slotPeriod}>Period {slot.period}</span>
                    </div>
                    <div style={styles.slotDetails}>
                      <span>🕐 {slot.time}</span>
                      <span>🏫 Class {slot.class}</span>
                    </div>
                    <div>
                      <div style={styles.subsLabel}>Available Free Teachers:</div>
                      {slot.freeTeachers.length === 0 ? (
                        <div style={styles.noSub}>⚠️ No free teacher available</div>
                      ) : (
                        <div style={styles.subsList}>
                          {slot.freeTeachers.slice(0, 3).map((t, idx) => (
                            <span key={idx} style={styles.subChip}>✅ {t.name}</span>
                          ))}
                          {slot.freeTeachers.length > 3 && (
                            <span
                              style={{ ...styles.moreChip, cursor: 'pointer', textDecoration: 'underline' }}
                              onClick={() => {
                                const remaining = slot.freeTeachers.slice(3).map(t => t.name).join(', ');
                                alert(`Other free teachers:\n${remaining}`);
                              }}
                            >
                              +{slot.freeTeachers.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button style={styles.submitBtn} onClick={handleSubmit}>
              ✅ Confirm & Submit Leave Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: { minHeight: '100vh', background: '#f0f4f8', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  headerBanner: { background: 'linear-gradient(135deg, #0d1b4b 0%, #1a3a8f 50%, #0a2466 100%)', padding: '32px 32px 28px' },
  headerContent: { maxWidth: 900, margin: '0 auto' },
  title: { fontSize: 26, fontWeight: 800, color: '#ffffff', margin: 0 },
  subtitle: { color: 'rgba(255,255,255,0.65)', marginTop: 6, marginBottom: 0, fontSize: 14 },
  container: { padding: '28px 32px', maxWidth: 900, margin: '0 auto' },
  card: { background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(26,58,143,0.08)', marginBottom: 24, border: '1px solid #e2e8f0' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 14, borderBottom: '2px solid #f0f4f8' },
  sectionDot: { width: 4, height: 20, background: 'linear-gradient(180deg, #1a3a8f, #0d1b4b)', borderRadius: 4, display: 'inline-block' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#0d1b4b', letterSpacing: '0.02em' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  formGroup: { marginBottom: 20 },
  required: { color: '#e53e3e' },
  label: { display: 'block', fontWeight: 600, color: '#374151', marginBottom: 8, fontSize: 13 },
  input: { width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', color: '#1e293b', boxSizing: 'border-box', background: '#fafbff' },
  select: { width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', color: '#1e293b', background: '#fafbff', cursor: 'pointer', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical', color: '#1e293b', boxSizing: 'border-box', background: '#fafbff' },
  leaveTypeGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  leaveTypeCard: { padding: '14px 10px', borderRadius: 10, border: '2px solid #e2e8f0', textAlign: 'center', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#64748b', background: '#f8fafc', transition: 'all 0.2s' },
  leaveTypeCardActive: { border: '2px solid #1a3a8f', background: '#eef2ff', color: '#1a3a8f', boxShadow: '0 2px 12px rgba(26,58,143,0.15)' },
  previewBtn: { background: 'linear-gradient(135deg, #1a3a8f, #0d1b4b)', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 14px rgba(26,58,143,0.3)' },
  previewSection: { marginTop: 8 },
  summaryBox: { background: '#fff', borderRadius: 14, padding: 24, marginBottom: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(26,58,143,0.06)', borderLeft: '4px solid #1a3a8f' },
  summaryTitle: { fontSize: 15, fontWeight: 700, color: '#0d1b4b', marginBottom: 16, marginTop: 0 },
  summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  summaryItem: { display: 'flex', flexDirection: 'column', gap: 3 },
  summaryKey: { fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' },
  summaryVal: { fontSize: 14, color: '#1e293b', fontWeight: 600 },
  previewTitle: { fontSize: 18, fontWeight: 700, color: '#0d1b4b', marginBottom: 16 },
  slotGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 },
  slotCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  slotHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  slotDay: { fontWeight: 700, color: '#1e293b', fontSize: 13 },
  slotPeriod: { background: '#dbeafe', color: '#1d4ed8', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 },
  slotDetails: { display: 'flex', gap: 16, color: '#64748b', fontSize: 12, marginBottom: 12 },
  subsLabel: { fontWeight: 600, color: '#374151', fontSize: 12, marginBottom: 8 },
  noSub: { background: '#fef2f2', color: '#dc2626', borderRadius: 8, padding: '8px 12px', fontSize: 12 },
  subsList: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  subChip: { background: '#f0fdf4', color: '#166534', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600 },
  moreChip: { background: '#f1f5f9', color: '#64748b', borderRadius: 20, padding: '4px 10px', fontSize: 11 },
  submitBtn: { background: 'linear-gradient(135deg, #0d1b4b, #1a3a8f)', color: '#fff', border: 'none', padding: '14px 36px', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700, width: '100%', boxShadow: '0 4px 16px rgba(26,58,143,0.3)' },
  successBox: { background: '#fff', borderRadius: 20, padding: 60, textAlign: 'center', boxShadow: '0 8px 40px rgba(26,58,143,0.1)', maxWidth: 500, margin: '80px auto', border: '1px solid #e2e8f0' },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: 800, color: '#0d1b4b', marginBottom: 12 },
  successMsg: { color: '#64748b', fontSize: 15, lineHeight: 1.6 },
};