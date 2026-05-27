import express from "express";
import {
  createAdmissionEmi,
  getEmisByAdmission,
  getAllEmis,
  getEmiById,
  updateEmiPayment,
  deleteEmi,
} from "../../controllers/Core/AdmissionEmi.controller.ts";

const router = express.Router();

router.post("/", createAdmissionEmi);
router.get("/admission/:admissionId", getEmisByAdmission);
router.get("/", getAllEmis);
router.get("/:id", getEmiById);
router.patch("/:id/payment", updateEmiPayment);
router.delete("/:id", deleteEmi);

export default router;
