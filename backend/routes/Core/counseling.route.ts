import express from "express";
import {
  createCounseling,
  getAllCounselings,
  getCounselingById,
  updateCounselingStatus,
  updateCounseling,
  deleteCounseling,
} from "../../controllers/Core/Counseling.controller.ts";

const router = express.Router();

router.post("/", createCounseling);
router.get("/", getAllCounselings);
router.get("/:id", getCounselingById);
router.patch("/:id/status", updateCounselingStatus);
router.put("/:id", updateCounseling);
router.delete("/:id", deleteCounseling);

export default router;
