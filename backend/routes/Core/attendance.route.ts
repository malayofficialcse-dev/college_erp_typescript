import express from "express";
import {
  markAttendance,
  bulkMarkAttendance,
  getAllAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
} from "../../controllers/Core/Attendance.controller.ts";

const router = express.Router();

router.post("/", markAttendance);
router.post("/bulk", bulkMarkAttendance);
router.get("/", getAllAttendance);
router.get("/:id", getAttendanceById);
router.put("/:id", updateAttendance);
router.delete("/:id", deleteAttendance);

export default router;
