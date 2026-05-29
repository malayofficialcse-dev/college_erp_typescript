import express from "express";

import {
  createUserController,
  getSingleUserController,
  getAllUserController,
  getUserPermissionsController,
  deleteUserController,
} from "../controllers/user.controller.ts";

const router = express.Router();

router.post("/create-user",createUserController);

router.get("/all-users",getAllUserController);

router.get("/:id/permissions", getUserPermissionsController);
router.get("/:id",getSingleUserController);

router.delete("/:id",deleteUserController);

export default router;
