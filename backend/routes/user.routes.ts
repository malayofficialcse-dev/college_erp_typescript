import express from "express";

import {
  createUserController,
  getSingleUserController,
  getAllUserController,
  getUserEmployeeController,
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
router.put("/:id/permissions", updateUserPermissionsController);
router.put("/:id", updateUserController);
router.get("/:id", getSingleUserController);
router.delete("/:id", deleteUserController);

export default router;
