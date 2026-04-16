// src/context/AppContext.js
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { initialTimetable, DAYS, PERIOD_TIMES } from '../data/initialData';

const AppContext = createContext();
const API = 'http://localhost:5000/api';

// ✅ Name se timetable numeric ID map
const NAME_TO_TIMETABLE_ID = {
  "Hod. Nishad Patel": 1,
  "Prof. C.P.Bhamare": 2,
  "Prof. Ratna Patil": 3,
  "Prof. Chaitali Patil": 4,
  "Prof. Aishwarya Patil": 5,
  "Prof. Niket Sharma": 6,
  "Dr. Nivedita Mali": 7,
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export function AppProvider({ children }) {
  const [staff, setStaff] = useState([]);
  const [timetable, setTimetable] = useState(initialTimetable);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`${API}/staff`, { headers: authHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) setStaff(data);
    } catch (err) {
      console.error('Staff fetch error:', err);
    }
  }, []);

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await fetch(`${API}/leaves`, { headers: authHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) setLeaveRequests(data);
    } catch (err) {
      console.error('Leaves fetch error:', err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
  try {
    const res = await fetch(`${API}/notifications`, { headers: authHeaders() });
    const data = await res.json();
    console.log('📬 Notifications fetched:', data); // ✅ add karo
    if (Array.isArray(data)) setNotifications(data);
  } catch (err) {
    console.error('Notifications fetch error:', err);
  }
}, []);

  useEffect(() => {
    if (currentUser && currentUser.token) {
      fetchStaff();
      fetchLeaves();
      fetchNotifications();
    }
  }, [currentUser]);

  // ✅ FIXED — name se timetable ID match karo
  const findFreeTeachers = useCallback((day, period, excludeTimetableId) => {
    // Busy teachers — timetable se
    const busyTimetableIds = new Set();
    Object.entries(timetable).forEach(([tid, slots]) => {
      if (parseInt(tid) === parseInt(excludeTimetableId)) return;
      slots.forEach(slot => {
        if (slot.day === day && slot.period === period) {
          busyTimetableIds.add(parseInt(tid));
        }
      });
    });

    // Free teachers — jo busy nahi hain aur jo leave lene wala nahi hai
    return staff.filter(t => {
      const timetableId = NAME_TO_TIMETABLE_ID[t.name];
      if (!timetableId) return false; // Admin ya unmapped staff skip
      if (timetableId === parseInt(excludeTimetableId)) return false; // Khud ko exclude
      if (busyTimetableIds.has(timetableId)) return false; // Busy teacher exclude
      return true;
    }).map(t => ({
      id: t._id, // ✅ MongoDB _id — backend ke liye
      name: t.name,
    }));
  }, [timetable, staff]);

  const getTeacherSlots = useCallback((teacherId, fromDate, toDate) => {
    const slots = timetable[teacherId] || [];
    const affectedSlots = [];
    const start = new Date(fromDate);
    const end = new Date(toDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayName = DAYS[d.getDay() - 1];
      if (!dayName) continue;
      const dateStr = d.toISOString().split('T')[0];

      slots.forEach(slot => {
        if (slot.day === dayName) {
          const freeTeachers = findFreeTeachers(dayName, slot.period, teacherId);
          affectedSlots.push({
            date: dateStr,
            day: dayName,
            period: slot.period,
            class: slot.class,
            time: PERIOD_TIMES[slot.period],
            freeTeachers, // ✅ MongoDB _id wale teachers
          });
        }
      });
    }
    return affectedSlots;
  }, [timetable, findFreeTeachers]);

  const applyLeave = useCallback(async (teacherId, fromDate, toDate, reason, extraData = {}) => {
    try {
      const slots = getTeacherSlots(teacherId, fromDate, toDate);

      const res = await fetch(`${API}/leaves`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          ...extraData,
          fromDate,
          toDate,
          reason,
          substituteRequests: slots.map(slot => ({
            ...slot,
            assignedTeacherId: null,
            subStatus: 'pending',
          })),
        }),
      });

      const data = await res.json();
      await fetchLeaves();
      await fetchNotifications();
      return data;
    } catch (err) {
      console.error('Apply leave error:', err);
    }
  }, [getTeacherSlots, fetchLeaves, fetchNotifications]);

  const updateLeaveStatus = useCallback(async (requestId, status) => {
    try {
      await fetch(`${API}/leaves/${requestId}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      await fetchLeaves();
      await fetchStaff();
      await fetchNotifications();
    } catch (err) {
      console.error('Update status error:', err);
    }
  }, [fetchLeaves, fetchStaff, fetchNotifications]);

  const acceptSubstitute = useCallback(async (requestId, slotIndex) => {
  try {
    const res = await fetch(`${API}/leaves/${requestId}/accept/${slotIndex}`, {
      method: 'PUT',
      headers: authHeaders(),
    });
    const data = await res.json();
    
    // ✅ Local state bhi turant update karo
    setLeaveRequests(prev => prev.map(req => {
      if (String(req._id) !== String(requestId)) return req;
      const updated = { ...req };
      updated.substituteRequests = updated.substituteRequests.map((sub, idx) => {
        if (idx !== slotIndex) return sub;
        return { ...sub, subStatus: 'accepted', acceptedByName: data.substituteRequests?.[slotIndex]?.acceptedByName };
      });
      return updated;
    }));

    await fetchLeaves();
    await fetchNotifications();
  } catch (err) {
    console.error('Accept substitute error:', err);
  }
}, [fetchLeaves, fetchNotifications]);
  const markNotificationRead = useCallback(async (id) => {
    try {
      await fetch(`${API}/notifications/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
      });
      await fetchNotifications();
    } catch {
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    }
  }, [fetchNotifications]);

  const addTimetableEntry = useCallback((teacherId, entry) => {
    setTimetable(prev => ({
      ...prev,
      [teacherId]: [...(prev[teacherId] || []), entry],
    }));
  }, []);

  const removeTimetableEntry = useCallback((teacherId, index) => {
    setTimetable(prev => ({
      ...prev,
      [teacherId]: prev[teacherId].filter((_, i) => i !== index),
    }));
  }, []);

  const addStaffMember = useCallback(async (member) => {
    try {
      const res = await fetch(`${API}/staff`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...member, password: 'staff123' }),
      });
      const data = await res.json();
      await fetchStaff();
      return data;
    } catch (err) {
      console.error('Add staff error:', err);
    }
  }, [fetchStaff]);

  return (
    <AppContext.Provider value={{
      staff, setStaff,
      timetable, setTimetable,
      leaveRequests, setLeaveRequests,
      notifications, markNotificationRead,
      currentUser, setCurrentUser,
      applyLeave,
      updateLeaveStatus,
      updateSubstitute: () => {},
      acceptSubstitute,
      addTimetableEntry,
      removeTimetableEntry,
      addStaffMember,
      getTeacherSlots,
      findFreeTeachers,
      fetchLeaves,
      fetchStaff,
      fetchNotifications,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);