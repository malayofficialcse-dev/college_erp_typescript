import type { Request, Response } from "express";
import {
  markStaffAttendanceService,
  getAllStaffAttendanceService,
  getStaffAttendanceByIdService,
  updateStaffAttendanceService,
  deleteStaffAttendanceService,
} from "../../Services/HR/StaffAttendance.service.ts";

export const markStaffAttendance = async (req: Request, res: Response) => {
  try {
    const attendance = await markStaffAttendanceService(req.body);
    res.status(201).json({
      success: true,
      message: "Staff attendance marked successfully",
      data: attendance,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllStaffAttendance = async (req: Request, res: Response) => {
  try {
    const { employee, status, date } = req.query as Record<string, string>;
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const attendance = await getAllStaffAttendanceService({
      employee,
      status,
      date: date ? new Date(date) : undefined,
      month,
      year,
    });
    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStaffAttendanceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Attendance id is required" });
    }
    const attendance = await getStaffAttendanceByIdService(id);
    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance record not found" });
    }
    res.status(200).json({ success: true, data: attendance });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStaffAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Attendance id is required" });
    }
    const attendance = await updateStaffAttendanceService(id, req.body);
    res.status(200).json({
      success: true,
      message: "Attendance record updated successfully",
      data: attendance,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStaffAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Attendance id is required" });
    }
    await deleteStaffAttendanceService(id);
    res
      .status(200)
      .json({ success: true, message: "Attendance record deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
