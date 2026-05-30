import express from "express";
import {
  createScholarship,
  deleteScholarship,
  getScholarships,
  updateScholarship,
} from "../../controllers/Finance/scholarship.controller.ts";

const router = express.Router();

router.get("/", getScholarships);
router.post("/", createScholarship);
router.put("/:id", updateScholarship);
router.delete("/:id", deleteScholarship);

export default router;
