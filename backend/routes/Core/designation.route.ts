import express from "express";
import {
  createDesignation,
  getDesignationById,
  getAllDesignations,
  updateDesignationById,
  deleteDesignationById,
} from "../../controllers/Core/Designation.controller.ts";

const router = express.Router();

router.post("/", createDesignation);
router.get("/", getAllDesignations);
router.get("/:id", getDesignationById);
router.put("/:id", updateDesignationById);
router.delete("/:id", deleteDesignationById);

export default router;
