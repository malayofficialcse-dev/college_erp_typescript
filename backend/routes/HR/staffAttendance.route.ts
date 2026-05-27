import express from "express";
import {
  markStaffAttendance,
  getAllStaffAttendance,
  getStaffAttendanceById,
  updateStaffAttendance,
  deleteStaffAttendance,
} from "../../controllers/HR/StaffAttendance.controller.ts";

const router = express.Router();

router.post("/", markStaffAttendance);
router.get("/", getAllStaffAttendance);
router.get("/:id", getStaffAttendanceById);
router.put("/:id", updateStaffAttendance);
router.delete("/:id", deleteStaffAttendance);

export default router;
