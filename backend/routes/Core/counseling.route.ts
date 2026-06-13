import express from "express";
import {
  createCounseling,
  getAllCounselings,
  getCounselingById,
  updateCounselingStatus,
  updateCounseling,
  deleteCounseling,
} from "../../controllers/Core/Counseling.controller.ts";
import { cacheResponse, clearCache } from "../../middleware/cache.middleware.ts";

const router = express.Router();

router.post("/", clearCache("/api/v1/counseling"), createCounseling);
router.get("/", cacheResponse(300), getAllCounselings);
router.get("/:id", getCounselingById);
router.patch("/:id/status", clearCache("/api/v1/counseling"), updateCounselingStatus);
router.put("/:id", clearCache("/api/v1/counseling"), updateCounseling);
router.delete("/:id", clearCache("/api/v1/counseling"), deleteCounseling);

export default router;
