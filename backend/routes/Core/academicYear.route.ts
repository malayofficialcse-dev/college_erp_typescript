import express from "express";
import {
  createAcademicYear,
  deleteAcademicYear,
  getAcademicYearById,
  getAllAcademicYears,
  updateAcademicYear,
} from "../../controllers/Core/AcademicYear.controller.ts";

const router = express.Router();

router.post("/", createAcademicYear);
router.get("/", getAllAcademicYears);
router.get("/:id", getAcademicYearById);
router.put("/:id", updateAcademicYear);
router.delete("/:id", deleteAcademicYear);

export default router;
