import type { Request, Response } from "express";
import ExamResult from "../../Models/Core/ExamResult.ts";
import Attendance from "../../Models/Core/Attendance.ts";
import FeeInvoice from "../../Models/Finance/FeeInvoice.ts";
import Timetable from "../../Models/Core/Timetable.ts";
import ExamSchedule from "../../Models/Core/ExamSchedule.ts";
import Student from "../../Models/Core/Student.ts";

export const getStudentGrades = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const grades = await ExamResult.find({ student: studentId })
      .populate("subject", "name code")
      .populate("examSchedule", "examName examDate")
      .sort({ semesterNumber: -1, createdAt: -1 });

    res.status(200).json({ success: true, data: grades });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentAttendance = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const attendanceRecords = await Attendance.find({ student: studentId })
      .populate("subject", "name code")
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: attendanceRecords });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentFees = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const invoices = await FeeInvoice.find({ student: studentId }).sort({
      dueDate: -1,
    });

    res.status(200).json({ success: true, data: invoices });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentTimetable = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).select("section");
    if (!student || !student.section) {
      return res.status(200).json({ success: true, data: [] });
    }

    const timetable = await Timetable.find({ section: student.section })
      .populate("subject", "name code")
      .populate("teacher", "firstName lastName")
      .populate("classroom", "roomNumber building");

    res.status(200).json({ success: true, data: timetable });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentExamSchedule = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).select("course currentSemester");
    if (!student || !student.course) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Exam schedules might be linked by course and semester
    const schedules = await ExamSchedule.find({
      course: student.course,
      semester: student.currentSemester,
    }).populate("subject", "name code");

    res.status(200).json({ success: true, data: schedules });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
