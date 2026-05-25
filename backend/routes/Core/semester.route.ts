import express from "express";
import {
  createSemester,
  deleteSemester,
  getAllSemesters,
  getSemesterById,
  updateSemester,
} from "../../controllers/Core/Semester.controller.ts";

const router = express.Router();

router.post("/", createSemester);
router.get("/", getAllSemesters);
router.get("/:id", getSemesterById);
router.put("/:id", updateSemester);
router.delete("/:id", deleteSemester);

export default router;
