import express from "express";
import {
  createExamSchedule,
  getAllExamSchedules,
  getExamScheduleById,
  updateExamSchedule,
  deleteExamSchedule,
} from "../../controllers/Core/ExamSchedule.controller.ts";

const router = express.Router();

router.post("/", createExamSchedule);
router.get("/", getAllExamSchedules);
router.get("/:id", getExamScheduleById);
router.put("/:id", updateExamSchedule);
router.delete("/:id", deleteExamSchedule);

export default router;
