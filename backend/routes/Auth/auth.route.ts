import express from "express";
import { loginController, changePasswordController } from "../../controllers/Auth/auth.controller.ts";
import { authRateLimiter } from "../../middleware/rateLimit.middleware.ts";

const router = express.Router();

router.post("/login", authRateLimiter, loginController);
router.post("/change-password", authRateLimiter, changePasswordController);

export default router;

