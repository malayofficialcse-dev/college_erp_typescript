import express from "express";
import {
  createClassroom,
  deleteClassroom,
  getAllClassrooms,
  getClassroomById,
  updateClassroom,
} from "../../controllers/Core/Classroom.controller.ts";

const router = express.Router();

router.post("/", createClassroom);
router.get("/", getAllClassrooms);
router.get("/:id", getClassroomById);
router.put("/:id", updateClassroom);
router.delete("/:id", deleteClassroom);

export default router;
