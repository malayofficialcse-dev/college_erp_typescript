import express from "express";
import {
  createAdmission,
  getAllAdmissions,
  getAdmissionById,
  updateAdmission,
  deleteAdmission,
  getAdmissionStats,
} from "../../controllers/Core/Admission.controller.ts";
import { cacheResponse, clearCache } from "../../middleware/cache.middleware.ts";

const router = express.Router();

router.get("/stats", cacheResponse(300), getAdmissionStats);
router.post("/", clearCache("/api/v1/admissions"), createAdmission);
router.get("/", cacheResponse(300), getAllAdmissions);
router.get("/:id", getAdmissionById);
router.put("/:id", clearCache("/api/v1/admissions"), updateAdmission);
router.delete("/:id", clearCache("/api/v1/admissions"), deleteAdmission);

export default router;
