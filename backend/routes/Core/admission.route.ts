import express from "express";
import {
  createAdmission,
  getAllAdmissions,
  getAdmissionById,
  updateAdmission,
  deleteAdmission,
  getAdmissionStats,
} from "../../controllers/Core/Admission.controller.ts";

const router = express.Router();

router.get("/stats", getAdmissionStats);
router.post("/", createAdmission);
router.get("/", getAllAdmissions);
router.get("/:id", getAdmissionById);
router.put("/:id", updateAdmission);
router.delete("/:id", deleteAdmission);

export default router;
