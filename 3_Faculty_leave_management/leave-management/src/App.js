// src/App.js
import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ApplyLeave from './pages/ApplyLeave';
import LeaveRequests from './pages/LeaveRequests';
import MyLeaves from './pages/MyLeaves';
import TimetablePage from './pages/TimetablePage';
import StaffPage from './pages/StaffPage';
import Home from './pages/Home';
import Login from './pages/Login';
import LeaveBalance from './pages/LeaveBalance';
import CalendarView from './pages/CalendarView'; // ✅ top pe add karo
import { useApp } from './context/AppContext';

function AppContent() {
  const [activePage, setActivePage] = useState('Home');
  const { currentUser } = useApp();

  const isLoggedIn = currentUser && currentUser.id !== undefined && currentUser.name !== '';

  const handleSetActivePage = (page) => {
    const publicPages = ['Home', 'Login'];
    if (!isLoggedIn && !publicPages.includes(page)) {
      setActivePage('Login');
      return;
    }
    setActivePage(page);
  };

  const renderPage = () => {
    if (!currentUser) {
      if (activePage === 'Login') return <Login setActivePage={handleSetActivePage} />;
      return <Home setActivePage={handleSetActivePage} />;
    }
    switch (activePage) {
      case 'Dashboard': return <Dashboard setActivePage={handleSetActivePage} />;
      case 'Apply Leave': return <ApplyLeave setActivePage={handleSetActivePage} />;
      case 'Leave Requests': return <LeaveRequests setActivePage={handleSetActivePage} />;
      case 'My Leaves': return <MyLeaves setActivePage={handleSetActivePage} />;
      case 'Leave Balance': return <LeaveBalance />;
      case 'Calendar': return <CalendarView />;  // ✅ ye add karo
      case 'Timetable': return <TimetablePage />;
      case 'Staff': return <StaffPage />;
      case 'Home': return <Home setActivePage={handleSetActivePage} />;
      case 'Login': return <Login setActivePage={handleSetActivePage} />;
      default: return <Dashboard setActivePage={handleSetActivePage} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar activePage={activePage} setActivePage={handleSetActivePage} />
      <main style={{ minHeight: 'calc(100vh - 64px)' }}>
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}