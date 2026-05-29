import type { Request, Response } from "express";
import {
  createNoticeService,
  getAllNoticesService,
  getNoticeByIdService,
  updateNoticeService,
  deleteNoticeService,
} from "../../Services/Communication/Notice.service.ts";

export const createNotice = async (req: Request, res: Response) => {
  try {
    const notice = await createNoticeService(req.body);
    res.status(201).json({ success: true, message: "Notice created successfully", data: notice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllNotices = async (req: Request, res: Response) => {
  try {
    const { noticeType, targetAudience, department } = req.query as Record<string, string>;
    const notices = await getAllNoticesService({ noticeType, targetAudience, department });
    res.status(200).json({ success: true, count: notices.length, data: notices });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNoticeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notice = await getNoticeByIdService(id);
    if (!notice) return res.status(404).json({ success: false, message: "Notice not found" });
    res.status(200).json({ success: true, data: notice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateNotice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notice = await updateNoticeService(id, req.body);
    res.status(200).json({ success: true, message: "Notice updated successfully", data: notice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteNoticeService(id);
    res.status(200).json({ success: true, message: "Notice deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
