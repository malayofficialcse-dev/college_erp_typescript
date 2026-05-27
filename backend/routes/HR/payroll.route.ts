import express from "express";
import {
  createPayroll,
  getAllPayrolls,
  getPayrollById,
  updatePayrollStatus,
  deletePayroll,
} from "../../controllers/HR/Payroll.controller.ts";

const router = express.Router();

router.post("/", createPayroll);
router.get("/", getAllPayrolls);
router.get("/:id", getPayrollById);
router.patch("/:id/status", updatePayrollStatus);
router.delete("/:id", deletePayroll);

export default router;
