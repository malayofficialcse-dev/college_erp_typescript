import express from "express";
import {
  createDesignation,
  getDesignationById,
  getAllDesignations,
  updateDesignationById,
  deleteDesignationById,
} from "../../controllers/Core/Designation.controller.ts";
import { cacheResponse, clearCache } from "../../middleware/cache.middleware.ts";

const router = express.Router();

router.post("/", clearCache("/api/v1/designation"), createDesignation);
router.get("/", cacheResponse(300), getAllDesignations);
router.get("/:id", getDesignationById);
router.put("/:id", clearCache("/api/v1/designation"), updateDesignationById);
router.delete("/:id", clearCache("/api/v1/designation"), deleteDesignationById);

export default router;
