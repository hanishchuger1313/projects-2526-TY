// src/pages/Login.js
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Login.css';

const API = 'http://localhost:5000/api';

// ✅ Timetable ID mapping
const TIMETABLE_MAP = [
  { name: "Hod. Nishad Patel", timetableId: 1 },
  { name: "Prof. C.P.Bhamare", timetableId: 2 },
  { name: "Prof. Ratna Patil", timetableId: 3 },
  { name: "Prof. Chaitali Patil", timetableId: 4 },
  { name: "Prof. Aishwarya Patil", timetableId: 5 },
  { name: "Prof. Niket Sharma", timetableId: 6 },
  { name: "Dr. Nivedita Mali", timetableId: 7 },
];

export default function Login({ setActivePage }) {
  const { setCurrentUser } = useApp();
  const [loginType, setLoginType] = useState('staff');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const email = loginType === 'admin'
        ? 'admin@college.edu'
        : username.includes('@') ? username : username;

      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      // ✅ Timetable ID dhundo
      const timetableEntry = TIMETABLE_MAP.find(s => s.name === data.name);

      localStorage.setItem('token', data.token);

      setCurrentUser({
        id: data._id,
        _id: data._id,  // ✅ Ye add karo
        timetableId: timetableEntry?.timetableId || null,
        name: data.name,
        role: data.role,
        email: data.email,
        leaveBalance: data.leaveBalance,
        token: data.token,
      });

      setActivePage('Dashboard');
    } catch (err) {
      setError('Server se connect nahi ho pa raha. Backend chal raha hai?');
    }

    setLoading(false);
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="login-left-content">
          <img
            src="/image.png"
            alt="SSVPSS College Logo"
            width={80}
            height={80}
            style={{ borderRadius: '50%', objectFit: 'contain', border: '3px solid rgba(255,255,255,0.3)' }}
          />
          <h1 className="login-college">SSVPSS Bapusaheb<br />Shivajirao Deore<br />Polytechnic</h1>
          <div className="login-divider" />
          <p className="login-tagline">Faculty Leave Management System</p>
          <ul className="login-perks">
            <li>📋 Apply &amp; track leave online</li>
            <li>🔄 Auto substitute assignment</li>
            <li>✅ Fast admin approvals</li>
            <li>🔔 Real-time notifications</li>
          </ul>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-toggle">
            <button
              className={`login-toggle-btn ${loginType === 'staff' ? 'active' : ''}`}
              onClick={() => { setLoginType('staff'); setError(''); setUsername(''); setPassword(''); }}
            >
              👨‍🏫 Staff Login
            </button>
            <button
              className={`login-toggle-btn ${loginType === 'admin' ? 'active' : ''}`}
              onClick={() => { setLoginType('admin'); setError(''); setUsername(''); setPassword(''); }}
            >
              🔐 Admin Login
            </button>
          </div>

          <h2 className="login-title">
            {loginType === 'admin' ? 'Administrator Portal' : 'Staff Portal'}
          </h2>
          <p className="login-subtitle">
            {loginType === 'admin'
              ? 'Sign in to manage leave requests and staff'
              : 'Sign in to apply and track your leaves'}
          </p>

          <form onSubmit={handleLogin} className="login-form">
            {loginType === 'staff' && (
              <div className="login-field">
                <label>Email</label>
                <input
                  type="text"
                  placeholder="e.g. ratna@college.edu"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            )}

            <div className="login-field">
              <label>Password</label>
              <div className="login-pass-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="login-eye" onClick={() => setShowPass(p => !p)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <div className="login-error">⚠️ {error}</div>}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? <span className="login-spinner" /> : (loginType === 'admin' ? 'Login as Admin' : 'Login as Staff')}
            </button>
          </form>

          {/* <div className="login-hint">
            {loginType === 'admin'
              ? <><strong>Credentials:</strong> password: <code>admin123</code></>
              : <><strong>Credentials:</strong> email: <code>ratna@college.edu</code> | password: <code>staff123</code></>
            }
          </div> */}
        </div>
      </div>
    </div>
  );
}