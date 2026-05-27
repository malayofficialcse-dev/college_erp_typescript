import express from "express";
import {
  createResignation,
  getAllResignations,
  getResignationById,
  updateResignationStatus,
  deleteResignation,
} from "../../controllers/HR/Resignation.controller.ts";

const router = express.Router();

router.post("/", createResignation);
router.get("/", getAllResignations);
router.get("/:id", getResignationById);
router.patch("/:id/status", updateResignationStatus);
router.delete("/:id", deleteResignation);

export default router;
