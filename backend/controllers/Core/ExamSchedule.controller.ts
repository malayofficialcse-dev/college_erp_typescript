import type { Request, Response } from "express";
import {
  createExamScheduleService,
  getAllExamSchedulesService,
  getExamScheduleByIdService,
  updateExamScheduleService,
  deleteExamScheduleService,
} from "../../Services/Core/ExamSchedule.service.ts";

export const createExamSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await createExamScheduleService(req.body);
    res.status(201).json({ success: true, message: "Exam schedule created successfully", data: schedule });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllExamSchedules = async (req: Request, res: Response) => {
  try {
    const { course, subject, semester, examType, status } = req.query as Record<string, string>;
    const semesterNumber = req.query.semesterNumber ? Number(req.query.semesterNumber) : undefined;
    const schedules = await getAllExamSchedulesService({ course, subject, semester, examType, status, semesterNumber });
    res.status(200).json({ success: true, count: schedules.length, data: schedules });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExamScheduleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Exam schedule id is required" });
    const schedule = await getExamScheduleByIdService(id);
    if (!schedule) return res.status(404).json({ success: false, message: "Exam schedule not found" });
    res.status(200).json({ success: true, data: schedule });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExamSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Exam schedule id is required" });
    const schedule = await updateExamScheduleService(id, req.body);
    res.status(200).json({ success: true, message: "Exam schedule updated successfully", data: schedule });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExamSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Exam schedule id is required" });
    await deleteExamScheduleService(id);
    res.status(200).json({ success: true, message: "Exam schedule deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
