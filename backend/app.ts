import express from "express";
import userRoutes from "./routes/user.routes.ts";
import departmentRoutes from "./routes/Core/department.route.ts";
import courseRoutes from "./routes/Core/course.route.ts";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api/v1/users",userRoutes);
app.use("/api/v1/department",departmentRoutes);
app.use("/api/v1/course",courseRoutes);

export default app;