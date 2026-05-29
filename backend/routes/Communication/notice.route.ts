import express from "express";
import {
  createNotice,
  getAllNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
} from "../../controllers/Communication/Notice.controller.ts";

const router = express.Router();

router.post("/", createNotice);
router.get("/", getAllNotices);
router.get("/:id", getNoticeById);
router.put("/:id", updateNotice);
router.delete("/:id", deleteNotice);

export default router;
