import express from "express";
import {
  getStudentGrades,
  getStudentAttendance,
  getStudentFees,
  getStudentTimetable,
  getStudentExamSchedule,
} from "../../controllers/Core/studentPortal.controller.ts";

const router = express.Router();

router.get("/:studentId/grades", getStudentGrades);
router.get("/:studentId/attendance", getStudentAttendance);
router.get("/:studentId/fees", getStudentFees);
router.get("/:studentId/timetable", getStudentTimetable);
router.get("/:studentId/exam-schedule", getStudentExamSchedule);

export default router;
