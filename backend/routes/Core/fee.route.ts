import express from "express";
import {
  createFeeRecord,
  searchFees,
  getFeeById,
  getTotalCollected,
  updateFeeStatus,
  deleteFee,
} from "../../controllers/Core/Fee.controller.ts";

const router = express.Router();

router.get("/search", searchFees);
router.get("/total-collected", getTotalCollected);
router.post("/", createFeeRecord);
router.get("/:id", getFeeById);
router.patch("/:id/status", updateFeeStatus);
router.delete("/:id", deleteFee);

export default router;
