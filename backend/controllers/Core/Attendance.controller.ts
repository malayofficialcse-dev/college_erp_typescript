import type { Request, Response } from "express";
import {
  markAttendanceService,
  bulkMarkAttendanceService,
  getAllAttendanceService,
  getAttendanceByIdService,
  updateAttendanceService,
  deleteAttendanceService,
} from "../../Services/Core/Attendance.service.ts";

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const attendance = await markAttendanceService(req.body);
    res.status(201).json({ success: true, message: "Attendance marked successfully", data: attendance });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkMarkAttendance = async (req: Request, res: Response) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ success: false, message: "Expected an array of attendance records" });
    const attendance = await bulkMarkAttendanceService(req.body);
    res.status(201).json({ success: true, message: "Bulk attendance marked successfully", data: attendance });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAttendance = async (req: Request, res: Response) => {
  try {
    const { student, subject, status, date, department } = req.query as Record<string, string>;
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    
    const parsedDate = date ? new Date(date) : undefined;
    const attendance = await getAllAttendanceService({ student, subject, status, date: parsedDate, month, year, department });
    res.status(200).json({ success: true, count: attendance.length, data: attendance });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttendanceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Attendance id is required" });
    const attendance = await getAttendanceByIdService(id);
    if (!attendance) return res.status(404).json({ success: false, message: "Attendance record not found" });
    res.status(200).json({ success: true, data: attendance });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Attendance id is required" });
    const attendance = await updateAttendanceService(id, req.body);
    res.status(200).json({ success: true, message: "Attendance updated successfully", data: attendance });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Attendance id is required" });
    await deleteAttendanceService(id);
    res.status(200).json({ success: true, message: "Attendance record deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
