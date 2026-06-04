import express from "express";
import { loginController, changePasswordController } from "../../controllers/Auth/auth.controller.ts";

const router = express.Router();

router.post("/login", loginController);
router.post("/change-password", changePasswordController);

export default router;

