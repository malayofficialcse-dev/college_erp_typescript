import express from "express";
import {
  createSection,
  getAllSections,
  getSectionById,
  updateSection,
  deleteSection,
} from "../../controllers/Core/Section.controller.ts";

const router = express.Router();

router.post("/", createSection);
router.get("/", getAllSections);
router.get("/:id", getSectionById);
router.put("/:id", updateSection);
router.delete("/:id", deleteSection);

export default router;
