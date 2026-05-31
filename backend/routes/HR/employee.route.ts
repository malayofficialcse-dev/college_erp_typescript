import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  createEmployeeUserAccount,
} from "../../controllers/HR/Employee.controller.ts";

const router = express.Router();

router.post("/", createEmployee);
router.get("/", getAllEmployees);
router.post("/:id/user-account", createEmployeeUserAccount);
router.get("/:id", getEmployeeById);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;
