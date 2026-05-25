import express from "express";
import {
  createSubject,
  deleteSubject,
  getAllSubjects,
  getSubjectById,
  searchSubjects,
  updateSubject,
} from "../../controllers/Core/Subject.controller.ts";

const router = express.Router();

router.get("/search", searchSubjects);
router.post("/", createSubject);
router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

export default router;
