import express from "express";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../../controllers/Core/Student.controller.ts";
import { cacheResponse, clearCache } from "../../middleware/cache.middleware.ts";

const router = express.Router();

router.post("/", clearCache("/api/v1/students"), createStudent);
router.get("/", cacheResponse(300), getAllStudents);
router.get("/:id", getStudentById);
router.put("/:id", clearCache("/api/v1/students"), updateStudent);
router.delete("/:id", clearCache("/api/v1/students"), deleteStudent);

export default router;
