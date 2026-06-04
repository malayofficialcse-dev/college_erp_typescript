import express from "express";

import {
  createUserController,
  getSingleUserController,
  getAllUserController,
  getUserEmployeeController,
  getUserStudentController,
  getUserPermissionsController,
  updateUserController,
  updateUserPermissionsController,
  deleteUserController,
} from "../controllers/user.controller.ts";

const router = express.Router();

router.post("/create-user", createUserController);
router.get("/", getAllUserController);
router.get("/all-users", getAllUserController);
router.get("/:id/permissions", getUserPermissionsController);
router.get("/:id/employee", getUserEmployeeController);
router.get("/:id/student", getUserStudentController);
router.put("/:id/permissions", updateUserPermissionsController);
router.put("/:id", updateUserController);
router.get("/:id", getSingleUserController);
router.delete("/:id", deleteUserController);

export default router;
