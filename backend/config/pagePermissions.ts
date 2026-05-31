export type PageDefinition = {
  key: string;
  label: string;
  path: string;
  alwaysVisible?: boolean;
};

export type PagePermissionGroup = {
  title: string;
  pages: PageDefinition[];
};

export const PAGE_PERMISSION_GROUPS: PagePermissionGroup[] = [
  {
    title: "Main",
    pages: [
      { key: "dashboard", label: "Dashboard", path: "/dashboard", alwaysVisible: true },
    ],
  },
  {
    title: "Academics",
    pages: [
      { key: "academic-years", label: "Academic Years", path: "/academic-years" },
      { key: "semesters", label: "Semesters", path: "/semesters" },
      { key: "teachers", label: "Teachers", path: "/teachers" },
      { key: "courses", label: "Courses", path: "/courses" },
      { key: "subjects", label: "Subjects", path: "/subjects" },
      { key: "timetable", label: "Timetable", path: "/timetable" },
      { key: "attendance", label: "Attendance", path: "/attendance" },
      { key: "exam-schedules", label: "Exam Schedules", path: "/exam-schedules" },
      { key: "exam-results", label: "Exam Results", path: "/exam-results" },
    ],
  },
  {
    title: "Admission",
    pages: [
      { key: "counseling", label: "Counseling", path: "/counseling" },
      { key: "admissions", label: "Admissions", path: "/admissions" },
      { key: "students", label: "Admitted Students", path: "/students" },
    ],
  },
  {
    title: "Core System",
    pages: [
      { key: "core-counseling", label: "Counseling", path: "/core/counseling" },
      { key: "core-admissions", label: "Admissions", path: "/core/admissions" },
      { key: "core-academic-years", label: "Academic Years", path: "/core/academic-years" },
      { key: "core-semesters", label: "Semesters", path: "/core/semesters" },
      { key: "core-departments", label: "Departments", path: "/core/departments" },
      { key: "core-courses", label: "Courses", path: "/core/courses" },
      { key: "core-students", label: "Students", path: "/core/students" },
      { key: "core-teachers", label: "Teachers", path: "/core/teachers" },
      { key: "core-subjects", label: "Subjects", path: "/core/subjects" },
      { key: "core-classrooms", label: "Classrooms", path: "/core/classrooms" },
      { key: "core-sections", label: "Sections", path: "/core/sections" },
      { key: "core-sessions", label: "Sessions", path: "/core/sessions" },
      { key: "core-subject-assignments", label: "Subject Assignments", path: "/core/subject-assignments" },
      { key: "core-timetable", label: "Timetable", path: "/core/timetable" },
      { key: "core-attendance", label: "Attendance", path: "/core/attendance" },
      { key: "core-exam-schedules", label: "Exam Schedules", path: "/core/exam-schedules" },
      { key: "core-exam-results", label: "Exam Results", path: "/core/exam-results" },
    ],
  },
  {
    title: "Employee Centre",
    pages: [
      { key: "my-profile", label: "My Profile", path: "/my-profile" },
      { key: "my-leaves", label: "My Leaves", path: "/my-leaves" },
      { key: "my-attendance", label: "My Attendance", path: "/my-attendance" },
      { key: "my-payslips", label: "My Payslips", path: "/my-payslips" },
      { key: "my-resignation", label: "My Resignation", path: "/my-resignation" },
    ],
  },
  {
    title: "HR & Admin",
    pages: [
      { key: "employees", label: "Staff Registry", path: "/employees" },
      { key: "staff-attendance", label: "Staff Attendance", path: "/staff-attendance" },
      { key: "hr-leave-inbox", label: "Leave Inbox", path: "/hr-leave-inbox" },
      { key: "hr-resignation-inbox", label: "Resignation Inbox", path: "/hr-resignation-inbox" },
      { key: "leaves", label: "All Leave Requests", path: "/leaves" },
      { key: "leave-approvals", label: "Leave Approvals", path: "/leave-approvals" },
      { key: "payroll", label: "Payroll", path: "/payroll" },
      { key: "user-management", label: "User Management", path: "/user-management" },
    ],
  },
  {
    title: "Finance",
    pages: [
      { key: "fees", label: "Transaction List", path: "/fees" },
      { key: "payment-analysis", label: "Payment Analysis", path: "/payment-analysis" },
      { key: "fee-invoices", label: "Fee Invoices", path: "/fee-invoices" },
      { key: "scholarships", label: "Scholarships", path: "/scholarships" },
    ],
  },
  {
    title: "Facilities",
    pages: [
      { key: "library", label: "Library", path: "/library" },
      { key: "book-reservations", label: "Book Reservations", path: "/book-reservations" },
      { key: "hostel", label: "Hostel", path: "/hostel" },
      { key: "transport", label: "Transport", path: "/transport" },
    ],
  },
  {
    title: "Communication",
    pages: [
      { key: "notices", label: "Notice Board", path: "/notices" },
      { key: "events", label: "Events", path: "/events" },
      { key: "event-registrations", label: "Event Registrations", path: "/event-registrations" },
      { key: "notifications", label: "Notifications", path: "/notifications" },
    ],
  },
  {
    title: "Reports",
    pages: [
      { key: "reports", label: "Reports & Analytics", path: "/reports" },
    ],
  },
];

export const ALL_PAGE_KEYS = PAGE_PERMISSION_GROUPS.flatMap((group) =>
  group.pages.map((page) => page.key)
);

const TEACHER_VIEW_PAGES = new Set([
  "dashboard",
  "academic-years",
  "semesters",
  "teachers",
  "courses",
  "subjects",
  "timetable",
  "attendance",
  "exam-schedules",
  "exam-results",
  "students",
  "my-profile",
  "my-leaves",
  "my-attendance",
  "my-payslips",
  "my-resignation",
]);

const TEACHER_CREATE_PAGES = new Set([
  "my-leaves",
  "my-attendance",
  "my-resignation",
]);

const STAFF_VIEW_PAGES = new Set([
  "dashboard",
  "my-profile",
  "my-leaves",
  "my-attendance",
  "my-payslips",
  "my-resignation",
]);

const STAFF_CREATE_PAGES = new Set([
  "my-leaves",
  "my-attendance",
  "my-resignation",
]);

const getDefaultPageAccess = (pageKey: string, roles: string[]) => {
  const isAdmin = roles.includes("ROLE_ADMIN");
  const isTeacher = roles.includes("ROLE_TEACHER");
  const isStaff = roles.includes("ROLE_STAFF");

  if (isAdmin) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }

  if (pageKey === "dashboard") {
    return { canView: true, canCreate: false, canEdit: false, canDelete: false };
  }

  if (isTeacher) {
    return {
      canView: TEACHER_VIEW_PAGES.has(pageKey),
      canCreate: TEACHER_CREATE_PAGES.has(pageKey),
      canEdit: TEACHER_CREATE_PAGES.has(pageKey),
      canDelete: false,
    };
  }

  if (isStaff) {
    return {
      canView: STAFF_VIEW_PAGES.has(pageKey),
      canCreate: STAFF_CREATE_PAGES.has(pageKey),
      canEdit: STAFF_CREATE_PAGES.has(pageKey),
      canDelete: false,
    };
  }

  return { canView: false, canCreate: false, canEdit: false, canDelete: false };
};

export const buildDefaultPagePermissions = (roles: string[] = []) =>
  ALL_PAGE_KEYS.map((pageKey) => ({
    moduleName: pageKey,
    ...getDefaultPageAccess(pageKey, roles),
  }));
