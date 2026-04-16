// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import './Home.css';

const features = [
  { icon: '📋', title: 'Apply for Leave', desc: 'Submit leave requests online with all necessary details quickly and easily.' },
  { icon: '🔍', title: 'Track Status', desc: 'Monitor your leave application status in real-time from anywhere.' },
  { icon: '✅', title: 'Admin Approval', desc: 'Streamlined approval workflow for administrators to manage requests.' },
  { icon: '🔄', title: 'Substitute Management', desc: 'Automatic substitute teacher assignment for uninterrupted classes.' },
  { icon: '🔔', title: 'Notifications', desc: 'Instant alerts for approvals, rejections, and substitute requests.' },
  { icon: '📊', title: 'Leave Records', desc: 'Complete history and analytics of leave data for staff and admin.' },
];

const stats = [
  { value: '50+', label: 'Faculty Members' },
  { value: '100%', label: 'Digital Process' },
  { value: '24/7', label: 'System Access' },
  { value: '0', label: 'Paperwork' },
];

export default function Home({ setActivePage }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`home-root ${visible ? 'home-visible' : ''}`}>

      {/* ── HERO ── */}
      <section className="home-hero">
        <div className="home-hero-bg" />
        <div className="home-hero-content">

          {/* Real College Logo */}
          <div className="home-logo-wrapper">
            <img
              src="/image.png"
              alt="SSVPSS College Logo"
              width={90}
              height={90}
              style={{ borderRadius: '50%', objectFit: 'contain' }}
            />
          </div>

          <p className="home-estd">Established 1988</p>
          <h1 className="home-college-name">
            SSVPSS Bapusaheb Shivajirao Deore Polytechnic
          </h1>
          <div className="home-divider" />
          <h2 className="home-system-title">Faculty Leave Management System</h2>
          <p className="home-subtitle">
            A centralized digital platform to apply, track, and manage faculty leave requests with automated substitute arrangements.
          </p>
          <div className="home-hero-actions">
            <button className="home-btn-primary" onClick={() => setActivePage('Login')}>
              Login to Portal →
            </button>
            <button className="home-btn-secondary" onClick={() => setActivePage('Login')}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="home-stats">
        {stats.map((s, i) => (
          <div className="home-stat-card" key={i}>
            <div className="home-stat-value">{s.value}</div>
            <div className="home-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section className="home-features-section">
        <h3 className="home-section-title">System Features</h3>
        <p className="home-section-sub">Everything you need to manage faculty leave efficiently</p>
        <div className="home-features-grid">
          {features.map((f, i) => (
            <div className="home-feature-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="home-feature-icon">{f.icon}</div>
              <div className="home-feature-title">{f.title}</div>
              <div className="home-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <h3 className="home-cta-title">Ready to Get Started?</h3>
          <p className="home-cta-sub">Login as Staff or Admin to access the portal</p>
          <div className="home-cta-buttons">
            <button className="home-cta-btn staff" onClick={() => setActivePage('Login')}>
              👨‍🏫 Staff Login
            </button>
            <button className="home-cta-btn admin" onClick={() => setActivePage('Login')}>
              🔐 Admin Login
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <p>© 2025 SSVPSS Bapusaheb Shivajirao Deore Polytechnic. All rights reserved.</p>
        <p style={{ marginTop: '4px', fontSize: '0.78rem', opacity: 0.6 }}>Faculty Leave Management System</p>
      </footer>
    </div>
  );
}