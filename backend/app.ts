import express from "express";
import userRoutes from "./routes/user.routes.ts";
import departmentRoutes from "./routes/Core/department.route.ts";
import courseRoutes from "./routes/Core/course.route.ts";
import academicYearRoutes from "./routes/Core/academicYear.route.ts";
import semesterRoutes from "./routes/Core/semester.route.ts";
import studentPortalRoutes from "./routes/Core/studentPortal.route.ts";
import subjectRoutes from "./routes/Core/subject.route.ts";
import classroomRoutes from "./routes/Core/classroom.route.ts";

// HR module routes
import employeeRoutes from "./routes/HR/employee.route.ts";
import leaveRoutes from "./routes/HR/leave.route.ts";
import leaveApprovalStepRoutes from "./routes/HR/leaveApprovalStep.route.ts";
import payrollRoutes from "./routes/HR/payroll.route.ts";
import resignationRoutes from "./routes/HR/resignation.route.ts";
import staffAttendanceRoutes from "./routes/HR/staffAttendance.route.ts";

// Core module routes (additional)
import studentRoutes from "./routes/Core/student.route.ts";
import teacherRoutes from "./routes/Core/teacher.route.ts";
import sectionRoutes from "./routes/Core/section.route.ts";
import sessionRoutes from "./routes/Core/session.route.ts";
import admissionRoutes from "./routes/Core/admission.route.ts";
import admissionEmiRoutes from "./routes/Core/admissionEmi.route.ts";
import attendanceRoutes from "./routes/Core/attendance.route.ts";
import examResultRoutes from "./routes/Core/examResult.route.ts";
import examScheduleRoutes from "./routes/Core/examSchedule.route.ts";
import timetableRoutes from "./routes/Core/timetable.route.ts";
import subjectAssignmentRoutes from "./routes/Core/subjectAssignment.route.ts";
import counselingRoutes from "./routes/Core/counseling.route.ts";
import feeRoutes from "./routes/Core/fee.route.ts";
import invoiceRoutes from "./routes/Finance/invoice.route.ts";
import scholarshipRoutes from "./routes/Finance/scholarship.route.ts";

import libraryRoutes from "./routes/facilities/library.route.ts";
import hostelRoutes from "./routes/facilities/hostel.route.ts";
import transportRoutes from "./routes/facilities/transport.route.ts";
import noticeRoutes from "./routes/Communication/notice.route.ts";
import eventRoutes from "./routes/Communication/event.route.ts";
import authRoutes from "./routes/Auth/auth.route.ts";
import { attachDepartmentScope } from "./middleware/departmentScope.ts";

import cors from "cors";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:5173"],
    credentials: true,
  })
);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ success: true, message: "ERP API is running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", attachDepartmentScope);

//core data module routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/department", departmentRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/academic-year", academicYearRoutes);
app.use("/api/v1/academic-years", academicYearRoutes);
app.use("/api/v1/semester", semesterRoutes);
app.use("/api/v1/semesters", semesterRoutes);
app.use("/api/v1/subject", subjectRoutes);
app.use("/api/v1/subjects", subjectRoutes);
app.use("/api/v1/classroom", classroomRoutes);
app.use("/api/v1/classrooms", classroomRoutes);

// Core module (additional)
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/core/students", studentRoutes);
app.use("/api/v1/teachers", teacherRoutes);
app.use("/api/v1/core/teachers", teacherRoutes);
app.use("/api/v1/sections", sectionRoutes);
app.use("/api/v1/core/sections", sectionRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/core/sessions", sessionRoutes);
app.use("/api/v1/student-portal", studentPortalRoutes);
app.use("/api/v1/admissions", admissionRoutes);
app.use("/api/v1/core/admissions", admissionRoutes);
app.use("/api/v1/admission-emi", admissionEmiRoutes);
app.use("/api/v1/admission-emis", admissionEmiRoutes);
app.use("/api/v1/core/admission-emis", admissionEmiRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/core/attendance", attendanceRoutes);
app.use("/api/v1/exam-results", examResultRoutes);
app.use("/api/v1/core/exam-results", examResultRoutes);
app.use("/api/v1/exam-schedules", examScheduleRoutes);
app.use("/api/v1/core/exam-schedules", examScheduleRoutes);
app.use("/api/v1/timetables", timetableRoutes);
app.use("/api/v1/core/timetables", timetableRoutes);
app.use("/api/v1/subject-assignments", subjectAssignmentRoutes);
app.use("/api/v1/core/subject-assignments", subjectAssignmentRoutes);
app.use("/api/v1/counseling", counselingRoutes);
app.use("/api/v1/core/counseling", counselingRoutes);
app.use("/api/v1/fees", feeRoutes);
app.use("/api/v1/finance/fees", feeRoutes);
app.use("/api/v1/finance/invoices", invoiceRoutes);
app.use("/api/v1/fee-invoices", invoiceRoutes);
app.use("/api/v1/scholarships", scholarshipRoutes);
app.use("/api/v1/finance/scholarships", scholarshipRoutes);

// HR module
app.use("/api/v1/hr/employees", employeeRoutes);
app.use("/api/v1/hr/leaves", leaveRoutes);
app.use("/api/v1/hr/leave-approval-steps", leaveApprovalStepRoutes);
app.use("/api/v1/hr/payrolls", payrollRoutes);
app.use("/api/v1/hr/resignations", resignationRoutes);
app.use("/api/v1/hr/staff-attendance", staffAttendanceRoutes);

// Facilities and Communication
app.use("/api/v1/library", libraryRoutes);
app.use("/api/v1/hostel", hostelRoutes);
app.use("/api/v1/transport", transportRoutes);
app.use("/api/v1/notices", noticeRoutes);
app.use("/api/v1/events", eventRoutes);

export default app;
