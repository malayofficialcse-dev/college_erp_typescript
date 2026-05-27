import express from "express";
import {
  createLeaveApprovalStep,
  getApprovalStepsByLeave,
  getLeaveApprovalStepById,
  updateLeaveApprovalStepStatus,
  deleteLeaveApprovalStep,
} from "../../controllers/HR/LeaveApprovalStep.controller.ts";

const router = express.Router();

router.post("/", createLeaveApprovalStep);
router.get("/leave/:leaveId", getApprovalStepsByLeave);
router.get("/:id", getLeaveApprovalStepById);
router.patch("/:id/status", updateLeaveApprovalStepStatus);
router.delete("/:id", deleteLeaveApprovalStep);

export default router;
