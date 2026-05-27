import type { Request, Response } from "express";
import {
  createTimetableService,
  getAllTimetablesService,
  getTimetableByIdService,
  updateTimetableService,
  deleteTimetableService,
} from "../../Services/Core/Timetable.service.ts";

export const createTimetable = async (req: Request, res: Response) => {
  try {
    const timetable = await createTimetableService(req.body);
    res.status(201).json({ success: true, message: "Timetable entry created successfully", data: timetable });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTimetables = async (req: Request, res: Response) => {
  try {
    const { course, subject, teacher, semester, section, dayOfWeek } = req.query as Record<string, string>;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;
    const timetables = await getAllTimetablesService({ course, subject, teacher, semester, section, dayOfWeek, isActive });
    res.status(200).json({ success: true, count: timetables.length, data: timetables });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTimetableById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Timetable id is required" });
    const timetable = await getTimetableByIdService(id);
    if (!timetable) return res.status(404).json({ success: false, message: "Timetable entry not found" });
    res.status(200).json({ success: true, data: timetable });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTimetable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Timetable id is required" });
    const timetable = await updateTimetableService(id, req.body);
    res.status(200).json({ success: true, message: "Timetable entry updated successfully", data: timetable });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTimetable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Timetable id is required" });
    await deleteTimetableService(id);
    res.status(200).json({ success: true, message: "Timetable entry deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
