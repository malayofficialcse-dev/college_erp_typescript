import type { Request, Response } from "express";
import {
  createExamResultService,
  getAllExamResultsService,
  getExamResultByIdService,
  updateExamResultService,
  deleteExamResultService,
} from "../../Services/Core/ExamResult.service.ts";

export const createExamResult = async (req: Request, res: Response) => {
  try {
    const result = await createExamResultService(req.body);
    res.status(201).json({ success: true, message: "Exam result created successfully", data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllExamResults = async (req: Request, res: Response) => {
  try {
    const { student, subject, examSchedule, resultStatus } = req.query as Record<string, string>;
    const semesterNumber = req.query.semesterNumber ? Number(req.query.semesterNumber) : undefined;
    const results = await getAllExamResultsService({ student, subject, examSchedule, resultStatus, semesterNumber });
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExamResultById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Exam result id is required" });
    const result = await getExamResultByIdService(id);
    if (!result) return res.status(404).json({ success: false, message: "Exam result not found" });
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExamResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Exam result id is required" });
    const result = await updateExamResultService(id, req.body);
    res.status(200).json({ success: true, message: "Exam result updated successfully", data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExamResult = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Exam result id is required" });
    await deleteExamResultService(id);
    res.status(200).json({ success: true, message: "Exam result deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
