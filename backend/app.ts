import express from "express";
import userRoutes from "./routes/user.routes.ts";
import departmentRoutes from "./routes/Core/department.route.ts";
import courseRoutes from "./routes/Core/course.route.ts";
import academicYearRoutes from "./routes/Core/academicYear.route.ts";
import semesterRoutes from "./routes/Core/semester.route.ts";
import subjectRoutes from "./routes/Core/subject.route.ts";
import classroomRoutes from "./routes/Core/classroom.route.ts";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ success: true, message: "ERP API is running" });
});

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

export default app;
