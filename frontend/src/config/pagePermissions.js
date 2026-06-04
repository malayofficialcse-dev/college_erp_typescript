export const PAGE_PERMISSION_GROUPS = [
  {
    title: 'Main',
    pages: [
      { key: 'dashboard', label: 'Dashboard', path: '/dashboard', alwaysVisible: true },
    ],
  },
  {
    title: 'Academics',
    pages: [
      { key: 'academic-years', label: 'Academic Years', path: '/academic-years' },
      { key: 'semesters', label: 'Semesters', path: '/semesters' },
      { key: 'teachers', label: 'Teachers', path: '/teachers' },
      { key: 'courses', label: 'Courses', path: '/courses' },
      { key: 'subjects', label: 'Subjects', path: '/subjects' },
      { key: 'timetable', label: 'Timetable', path: '/timetable' },
      { key: 'attendance', label: 'Attendance', path: '/attendance' },
      { key: 'exam-schedules', label: 'Exam Schedules', path: '/exam-schedules' },
      { key: 'exam-results', label: 'Exam Results', path: '/exam-results' },
    ],
  },
  {
    title: 'Admission',
    pages: [
      { key: 'counseling', label: 'Counseling', path: '/counseling' },
      { key: 'admissions', label: 'Admissions', path: '/admissions' },
      { key: 'students', label: 'Admitted Students', path: '/students' },
    ],
  },
  {
    title: 'Core System',
    pages: [
      { key: 'core-counseling', label: 'Counseling', path: '/core/counseling' },
      { key: 'core-admissions', label: 'Admissions', path: '/core/admissions' },
      { key: 'core-academic-years', label: 'Academic Years', path: '/core/academic-years' },
      { key: 'core-semesters', label: 'Semesters', path: '/core/semesters' },
      { key: 'core-departments', label: 'Departments', path: '/core/departments' },
      { key: 'core-courses', label: 'Courses', path: '/core/courses' },
      { key: 'core-students', label: 'Students', path: '/core/students' },
      { key: 'core-teachers', label: 'Teachers', path: '/core/teachers' },
      { key: 'core-subjects', label: 'Subjects', path: '/core/subjects' },
      { key: 'core-classrooms', label: 'Classrooms', path: '/core/classrooms' },
      { key: 'core-sections', label: 'Sections', path: '/core/sections' },
      { key: 'core-sessions', label: 'Sessions', path: '/core/sessions' },
      { key: 'core-subject-assignments', label: 'Subject Assignments', path: '/core/subject-assignments' },
      { key: 'core-timetable', label: 'Timetable', path: '/core/timetable' },
      { key: 'core-attendance', label: 'Attendance', path: '/core/attendance' },
      { key: 'core-exam-schedules', label: 'Exam Schedules', path: '/core/exam-schedules' },
      { key: 'core-exam-results', label: 'Exam Results', path: '/core/exam-results' },
    ],
  },
  {
    title: 'Student Portal',
    pages: [
      { key: 'student-portal-grades', label: 'My Grades', path: '/student-portal/my-grades', alwaysVisible: true },
      { key: 'student-portal-attendance', label: 'My Attendance', path: '/student-portal/my-attendance', alwaysVisible: true },
      { key: 'student-portal-fees', label: 'My Fees', path: '/student-portal/my-fees', alwaysVisible: true },
      { key: 'student-portal-timetable', label: 'My Timetable', path: '/student-portal/my-timetable', alwaysVisible: true },
      { key: 'student-portal-exams', label: 'My Exam Schedule', path: '/student-portal/my-exams', alwaysVisible: true },
    ],
  },
  {
    title: 'Employee Centre',
    pages: [
      { key: 'my-profile', label: 'My Profile', path: '/my-profile' },
      { key: 'my-leaves', label: 'My Leaves', path: '/my-leaves' },
      { key: 'my-attendance', label: 'My Attendance', path: '/my-attendance' },
      { key: 'my-payslips', label: 'My Payslips', path: '/my-payslips' },
      { key: 'my-resignation', label: 'My Resignation', path: '/my-resignation' },
    ],
  },
  {
    title: 'HR & Admin',
    pages: [
      { key: 'employees', label: 'Staff Registry', path: '/employees' },
      { key: 'staff-attendance', label: 'Staff Attendance', path: '/staff-attendance' },
      { key: 'hr-leave-inbox', label: 'Leave Inbox', path: '/hr-leave-inbox' },
      { key: 'hr-resignation-inbox', label: 'Resignation Inbox', path: '/hr-resignation-inbox' },
      { key: 'leaves', label: 'All Leave Requests', path: '/leaves' },
      { key: 'leave-approvals', label: 'Leave Approvals', path: '/leave-approvals' },
      { key: 'payroll', label: 'Payroll', path: '/payroll' },
      { key: 'user-management', label: 'User Management', path: '/user-management' },
    ],
  },
  {
    title: 'Finance',
    pages: [
      { key: 'fees', label: 'Transaction List', path: '/fees' },
      { key: 'payment-analysis', label: 'Payment Analysis', path: '/payment-analysis' },
      { key: 'fee-invoices', label: 'Fee Invoices', path: '/fee-invoices' },
      { key: 'scholarships', label: 'Scholarships', path: '/scholarships' },
    ],
  },
  {
    title: 'Facilities',
    pages: [
      { key: 'library', label: 'Library', path: '/library' },
      { key: 'book-reservations', label: 'Book Reservations', path: '/book-reservations' },
      { key: 'hostel', label: 'Hostel', path: '/hostel' },
      { key: 'transport', label: 'Transport', path: '/transport' },
    ],
  },
  {
    title: 'Communication',
    pages: [
      { key: 'notices', label: 'Notice Board', path: '/notices' },
      { key: 'events', label: 'Events', path: '/events' },
      { key: 'event-registrations', label: 'Event Registrations', path: '/event-registrations' },
      { key: 'notifications', label: 'Notifications', path: '/notifications' },
    ],
  },
  {
    title: 'Reports',
    pages: [
      { key: 'reports', label: 'Reports & Analytics', path: '/reports' },
    ],
  },
];

export const ALL_PAGES = PAGE_PERMISSION_GROUPS.flatMap((group) => group.pages);

export const PAGE_BY_KEY = Object.fromEntries(ALL_PAGES.map((page) => [page.key, page]));

export const getPageKeyFromPath = (pathname = '') => {
  const path = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  const sorted = [...ALL_PAGES].sort((a, b) => b.path.length - a.path.length);

  for (const page of sorted) {
    if (path === page.path || path.startsWith(`${page.path}/`)) {
      return page.key;
    }
  }

  return null;
};

export const createEmptyPagePermission = (pageKey) => ({
  moduleName: pageKey,
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
});

export const initializePagePermissions = (fetchedPermissions = []) => {
  const permissionMap = new Map(
    (fetchedPermissions || []).map((permission) => [permission.moduleName, permission])
  );

  return ALL_PAGES.map((page) => {
    const existing = permissionMap.get(page.key);
    return existing
      ? { ...createEmptyPagePermission(page.key), ...existing, moduleName: page.key }
      : createEmptyPagePermission(page.key);
  });
};
