import express from "express";
import {
  createLeave,
  getAllLeaves,
  getLeaveById,
  updateLeaveStatus,
  deleteLeave,
} from "../../controllers/HR/Leave.controller.ts";

const router = express.Router();

router.post("/", createLeave);
router.get("/", getAllLeaves);
router.get("/:id", getLeaveById);
router.patch("/:id/status", updateLeaveStatus);
router.delete("/:id", deleteLeave);

export default router;
