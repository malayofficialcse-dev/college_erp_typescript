import express from "express";
import { loginController } from "../../controllers/Auth/auth.controller.ts";

const router = express.Router();

router.post("/login", loginController);

export default router;
