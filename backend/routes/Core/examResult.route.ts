import express from "express";
import {
  createExamResult,
  getAllExamResults,
  getExamResultById,
  updateExamResult,
  deleteExamResult,
} from "../../controllers/Core/ExamResult.controller.ts";

const router = express.Router();

router.post("/", createExamResult);
router.get("/", getAllExamResults);
router.get("/:id", getExamResultById);
router.put("/:id", updateExamResult);
router.delete("/:id", deleteExamResult);

export default router;
