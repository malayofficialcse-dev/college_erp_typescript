import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Employees from './pages/HR/Employees';
import Students from './pages/Academics/Students';
import Courses from './pages/Core/Courses';
import Departments from './pages/Core/Departments';
import Classrooms from './pages/Core/Classrooms';
import Sections from './pages/Core/Sections';
import Sessions from './pages/Core/Sessions';
import SubjectAssignments from './pages/Core/SubjectAssignments';
import Teachers from './pages/Core/Teachers';
import Subjects from './pages/Core/Subjects';
import AcademicYears from './pages/Core/AcademicYears';
import Semesters from './pages/Core/Semesters';
import Attendance from './pages/Core/Attendance';
import ExamResults from './pages/Core/ExamResults';
import Notices from './pages/Communication/Notices';
import Events from './pages/Communication/Events';
import LeaveRequests from './pages/HR/LeaveRequests';
import Payroll from './pages/HR/Payroll';
import Fees from './pages/Finance/Fees';
import Scholarships from './pages/Finance/Scholarships';
import Library from './pages/Facilities/Library';
import Hostel from './pages/Facilities/Hostel';
import Transport from './pages/Facilities/Transport';
import Reports from './pages/Reports/Reports';
import Timetable from './pages/Core/Timetable';
import ExamSchedules from './pages/Core/ExamSchedules';
import EmployeeAttendance from './pages/HR/EmployeeAttendance';
import LeaveApprovals from './pages/HR/LeaveApprovals';
import FeeInvoices from './pages/Finance/FeeInvoices';
import BookReservations from './pages/Facilities/BookReservations';
import EventRegistrations from './pages/Communication/EventRegistrations';
import Notifications from './pages/Communication/Notifications';
import UserManagement from './pages/HR/UserManagement';
import PaymentAnalysis from './pages/Finance/PaymentAnalysis';
import Admissions from './pages/Academics/Admissions';
import AdmissionEmiSchedule from './pages/Academics/AdmissionEmiSchedule';
import Counseling from './pages/Academics/Counseling';
import CoreStudents from './pages/Core/Students';
import CoreAdmissions from './pages/Core/Admissions';
import CoreCounseling from './pages/Core/Counseling';

// Employee Centre
import MyProfile from './pages/EmployeeCentre/MyProfile';
import MyLeaves from './pages/EmployeeCentre/MyLeaves';
import MyAttendance from './pages/EmployeeCentre/MyAttendance';
import MyPayslips from './pages/EmployeeCentre/MyPayslips';
import MyResignation from './pages/EmployeeCentre/MyResignation';

// HR Inbox pages
import HrLeaveInbox from './pages/HR/HrLeaveInbox';
import HrResignationInbox from './pages/HR/HrResignationInbox';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="admissions" element={<Admissions />} />
              <Route path="admissions/:id/emi" element={<AdmissionEmiSchedule />} />
              <Route path="counseling" element={<Counseling />} />
              <Route path="students" element={<Students />} />
              <Route path="employees" element={<Employees />} />
              <Route path="courses" element={<Courses />} />
              <Route path="departments" element={<Departments />} />
              <Route path="classrooms" element={<Classrooms />} />
              <Route path="sections" element={<Sections />} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="subject-assignments" element={<SubjectAssignments />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="academic-years" element={<AcademicYears />} />
              <Route path="semesters" element={<Semesters />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="exam-results" element={<ExamResults />} />
              <Route path="core/admissions" element={<CoreAdmissions />} />
              <Route path="core/admissions/:id/emi" element={<AdmissionEmiSchedule />} />
              <Route path="core/counseling" element={<CoreCounseling />} />
              <Route path="core/students" element={<CoreStudents />} />
              <Route path="core/courses" element={<Courses />} />
              <Route path="core/departments" element={<Departments />} />
              <Route path="core/classrooms" element={<Classrooms />} />
              <Route path="core/sections" element={<Sections />} />
              <Route path="core/sessions" element={<Sessions />} />
              <Route path="core/subject-assignments" element={<SubjectAssignments />} />
              <Route path="core/teachers" element={<Teachers />} />
              <Route path="core/subjects" element={<Subjects />} />
              <Route path="core/academic-years" element={<AcademicYears />} />
              <Route path="core/semesters" element={<Semesters />} />
              <Route path="core/attendance" element={<Attendance />} />
              <Route path="core/timetable" element={<Timetable />} />
              <Route path="core/exam-schedules" element={<ExamSchedules />} />
              <Route path="core/exam-results" element={<ExamResults />} />
              <Route path="notices" element={<Notices />} />
              <Route path="events" element={<Events />} />
              <Route path="leaves" element={<LeaveRequests />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="fees" element={<Fees />} />
              <Route path="payment-analysis" element={<PaymentAnalysis />} />
              <Route path="scholarships" element={<Scholarships />} />
              <Route path="library" element={<Library />} />
              <Route path="hostel" element={<Hostel />} />
              <Route path="transport" element={<Transport />} />
              <Route path="reports" element={<Reports />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="exam-schedules" element={<ExamSchedules />} />
              <Route path="staff-attendance" element={<EmployeeAttendance />} />
              <Route path="leave-approvals" element={<LeaveApprovals />} />
              <Route path="fee-invoices" element={<FeeInvoices />} />
              <Route path="book-reservations" element={<BookReservations />} />
              <Route path="event-registrations" element={<EventRegistrations />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="user-management" element={<UserManagement />} />

              {/* Employee Centre Routes */}
              <Route path="my-profile" element={<MyProfile />} />
              <Route path="my-leaves" element={<MyLeaves />} />
              <Route path="my-attendance" element={<MyAttendance />} />
              <Route path="my-payslips" element={<MyPayslips />} />
              <Route path="my-resignation" element={<MyResignation />} />

              {/* HR Inbox Routes */}
              <Route path="hr-leave-inbox" element={<HrLeaveInbox />} />
              <Route path="hr-resignation-inbox" element={<HrResignationInbox />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
