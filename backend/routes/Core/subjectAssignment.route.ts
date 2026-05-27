import express from "express";
import {
  createSubjectAssignment,
  getAllSubjectAssignments,
  getSubjectAssignmentById,
  updateSubjectAssignment,
  deleteSubjectAssignment,
} from "../../controllers/Core/SubjectAssignment.controller.ts";

const router = express.Router();

router.post("/", createSubjectAssignment);
router.get("/", getAllSubjectAssignments);
router.get("/:id", getSubjectAssignmentById);
router.put("/:id", updateSubjectAssignment);
router.delete("/:id", deleteSubjectAssignment);

export default router;
