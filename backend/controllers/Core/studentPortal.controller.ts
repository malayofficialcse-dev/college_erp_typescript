import type { Request, Response } from "express";
import ExamResult from "../../Models/Core/ExamResult.ts";
import Attendance from "../../Models/Core/Attendance.ts";
import FeeInvoice from "../../Models/Finance/FeeInvoice.ts";
import Timetable from "../../Models/Core/Timetable.ts";
import ExamSchedule from "../../Models/Core/ExamSchedule.ts";
import Student from "../../Models/Core/Student.ts";
import Admission from "../../Models/Core/Admission.ts";
import AdmissionEmi from "../../Models/Core/AdmissionEmi.ts";

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
    const invoices = await FeeInvoice.find({ student: studentId }).sort({ dueDate: -1 });

    if (invoices.length > 0) {
      return res.status(200).json({ success: true, data: invoices });
    }

    const admissions = await Admission.find({ student: studentId }).select("_id admissionNumber");
    if (admissions.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const admissionIds = admissions.map((admission) => admission._id);
    const emis = await AdmissionEmi.find({ admission: { $in: admissionIds } })
      .populate("admission", "admissionNumber")
      .sort({ emiNumber: 1, dueDate: -1 });

    const emiRecords = emis.map((emi) => ({
      _id: emi._id,
      invoiceNumber: emi.admission?.admissionNumber
        ? `${String(emi.admission.admissionNumber)}-EMI${emi.emiNumber}`
        : `EMI-${emi.emiNumber}`,
      description: `EMI installment ${emi.emiNumber}`,
      dueDate: emi.dueDate,
      totalAmount: emi.emiAmount,
      paidAmount: emi.paidAmount || 0,
      status: emi.status,
      remarks: emi.remarks,
      paymentMethod: emi.paymentMethod,
      source: "EMI",
      emiNumber: emi.emiNumber,
    }));

    res.status(200).json({ success: true, data: emiRecords });
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

    // Exam schedules might be linked by course and semester (either by semester ObjectId or semester number)
    const query: Record<string, any> = { course: student.course };
    if (student.currentSemester !== undefined && student.currentSemester !== null) {
      // If currentSemester is a number use semesterNumber field, otherwise assume it's an ObjectId and use semester
      if (typeof student.currentSemester === 'number') {
        query.semesterNumber = student.currentSemester;
      } else {
        query.semester = student.currentSemester;
      }
    }

    const schedules = await ExamSchedule.find(query)
      .populate("subject", "subjectName subjectCode name code")
      .populate("classroom", "roomNumber building");

    res.status(200).json({ success: true, data: schedules });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
