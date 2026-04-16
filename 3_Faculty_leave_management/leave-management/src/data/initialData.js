// src/data/initialData.js

// ✅ Sirf ek total yearly leave
export const TOTAL_YEARLY_LEAVE = 12;

export const initialStaff = [
  { id: 1, name: "Hod. Nishad Patel", subject: "OSY, SFT", department: "Computer", email: "Npatel@college.edu", role: "teacher", leaveBalance: 52 },
  { id: 2, name: "Prof. C.P.Bhamare", subject: "OOP,MAD", department: "Computer", email: "bhamare@college.edu", role: "teacher", leaveBalance: 52 },
  { id: 3, name: "Prof. Ratna Patil", subject: "NIS,ACN", department: "Computer", email: "ratna@college.edu", role: "teacher", leaveBalance: 52 },
  { id: 4, name: "Prof. Chaitali Patil", subject: "Java", department: "Computer", email: "chaitali@college.edu", role: "teacher", leaveBalance: 52 },
  { id: 5, name: "Prof. Aishwarya Patil", subject: "linux", department: "Computer", email: "aishwarya@college.edu", role: "teacher", leaveBalance: 52 },
  { id: 6, name: "Prof. Niket Sharma", subject: "Paython", department: "Computer", email: "Niket@college.edu", role: "teacher", leaveBalance: 52 },
  { id: 7, name: "Dr. Nivedita Mali", subject: "CSS", department: "Computer", email: "nivedita@college.edu", role: "teacher", leaveBalance: 52 },
];

export const initialTimetable = {
  1: [
    { day: "Monday", period: 1, class: "3rd year (B Div)", subject: "SFT", time: "8:00-9:00" },
    { day: "Monday", period: 3, class: "3rd year(practical b1)", subject: "SFT", time: "10:00-11:00" },
    { day: "Tuesday", period: 3, class: "3rd year (A Div)", subject: "SFT", time: "11:45-12:45" },
    { day: "Tuesday", period: 5, class: "3rd year (A Div)", subject: "SFT", time: "2:15-3:15" },
    { day: "Wednesday", period: 2, class: "3rd year (A Div)", subject: "SFT", time: "10:30-11:30" },
    { day: "Thursday", period: 2, class: "3rd year (B Div)", subject: "SFT", time: "10:30-11:30" },
    { day: "Thursday", period: 5, class: "3rd year(practical b2)", subject: "SFT", time: "10:30-11:30" },
    { day: "Friday", period: 2, class: "3rd year (A Div)", subject: "SFT", time: "9:00-10:00" },
    { day: "Saturday", period: 1, class: "3rd year (B Div)", subject: "SFT", time: "9:00-10:00" },
  ],
  2: [
    { day: "Monday", period: 2, class: "3rd A", time: "9:00-10:00" },
    { day: "Tuesday", period: 1, class: "3rd A", time: "8:00-9:00" },
    { day: "Wednesday", period: 3, class: "3rd B", time: "10:00-11:00" },
    { day: "Thursday", period: 2, class: "3rd B", time: "9:00-10:00" },
    { day: "Friday", period: 4, class: "3rd A", time: "11:00-12:00" },
    { day: "Saturday", period: 4, class: "3rd A", time: "11:00-12:00" },
  ],
  3: [
    { day: "Monday", period: 4, class: "3rd B", time: "11:00-12:00" },
    { day: "Tuesday", period: 3, class: "3rd A", time: "10:00-11:00" },
    { day: "Wednesday", period: 2, class: "3rd A", time: "9:00-10:00" },
    { day: "Thursday", period: 1, class: "3rd B", time: "8:00-9:00" },
    { day: "Friday", period: 3, class: "3rd B", time: "10:00-11:00" },
    { day: "Saturday", period: 4, class: "3rd A", time: "11:00-12:00" },
  ],
  4: [
    { day: "Monday", period: 1, class: "2nd B", time: "8:00-9:00" },
    { day: "Tuesday", period: 4, class: "2nd A", time: "11:00-12:00" },
    { day: "Wednesday", period: 4, class: "2nd A", time: "11:00-12:00" },
    { day: "Thursday", period: 3, class: "2nd B", time: "10:00-11:00" },
    { day: "Friday", period: 1, class: "2nd B", time: "8:00-9:00" },
    { day: "Saturday", period: 4, class: "2nd A", time: "11:00-12:00" },
  ],
  5: [
    { day: "Monday", period: 3, class: "1st A", time: "10:00-11:00" },
    { day: "Tuesday", period: 2, class: "1st B", time: "9:00-10:00" },
    { day: "Wednesday", period: 1, class: "1st B", time: "8:00-9:00" },
    { day: "Thursday", period: 4, class: "1st A", time: "11:00-12:00" },
    { day: "Friday", period: 2, class: "1st A", time: "9:00-10:00" },
    { day: "Saturday", period: 4, class: "1st A", time: "11:00-12:00" },
  ],
  6: [
    { day: "Monday", period: 2, class: "2nd B", time: "9:00-10:00" },
    { day: "Tuesday", period: 1, class: "3rd A", time: "8:00-9:00" },
    { day: "Wednesday", period: 3, class: "2nd A", time: "10:00-11:00" },
    { day: "Thursday", period: 2, class: "3rd A", time: "9:00-10:00" },
    { day: "Friday", period: 4, class: "3rd B", time: "11:00-12:00" },
    { day: "Saturday", period: 4, class: "2nd A", time: "11:00-12:00" },
  ],
  7: [
    { day: "Monday", period: 4, class: "3rd A", time: "11:00-12:00" },
    { day: "Tuesday", period: 3, class: "3rd B", time: "10:00-11:00" },
    { day: "Wednesday", period: 4, class: "3rd B", time: "11:00-12:00" },
    { day: "Thursday", period: 1, class: "3rd A", time: "8:00-9:00" },
    { day: "Friday", period: 3, class: "3rd A", time: "10:00-11:00" },
    { day: "Saturday", period: 4, class: "3rd A", time: "11:00-12:00" },
  ],
};

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const PERIODS = [1, 2, 3, 4, 5, 6];
export const PERIOD_TIMES = {
  1: "9:00 - 10:00",
  2: "10:00 - 11:00",
  3: "11:45 - 12:45",
  4: "12:45 - 1:45",
  5: "2:00 - 3:00",
  6: "3:00 - 4:00"
};