import Attendance from "../../Models/Core/Attendance.ts";
import type { AttendanceStatus } from "../../Interfaces/Core/index.ts";

export interface ICreateAttendanceInput {
  student: string;
  subject: string;
  date: Date;
  status?: AttendanceStatus;
  remarks?: string;
  markedBy?: string;
}

export const markAttendanceService = async (data: ICreateAttendanceInput) => {
  const existing = await Attendance.findOne({
    student: data.student,
    subject: data.subject,
    date: data.date,
  });
  if (existing) {
    throw new Error(
      "Attendance already marked for this student and subject on this date"
    );
  }
  return Attendance.create(data);
};

export const bulkMarkAttendanceService = async (
  records: ICreateAttendanceInput[]
) => {
  return Attendance.insertMany(records, { ordered: false });
};

export const getAllAttendanceService = async (filter: {
  student?: string;
  subject?: string;
  status?: string;
  date?: Date;
  month?: number;
  year?: number;
  department?: string;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.student) {
    query.student = filter.student;
  } else if (filter.department) {
    const StudentModel = (await import("../../Models/Core/Student.ts")).default;
    const students = await StudentModel.find({ department: filter.department }).select("_id");
    const studentIds = students.map(s => s._id);
    query.student = { $in: studentIds };
  }
  if (filter.subject) query.subject = filter.subject;
  if (filter.status) query.status = filter.status;

  if (filter.date) {
    query.date = filter.date;
  } else if (filter.month !== undefined && filter.year !== undefined) {
    const start = new Date(filter.year, filter.month - 1, 1);
    const end = new Date(filter.year, filter.month, 1);
    query.date = { $gte: start, $lt: end };
  }

  return Attendance.find(query)
    .populate("student", "firstName lastName enrollmentNumber")
    .populate("subject", "subjectName subjectCode")
    .populate("markedBy", "firstName lastName")
    .sort({ date: -1 });
};

export const getAttendanceByIdService = async (id: string) => {
  return Attendance.findById(id)
    .populate("student", "firstName lastName enrollmentNumber")
    .populate("subject", "subjectName subjectCode")
    .populate("markedBy", "firstName lastName");
};

export const updateAttendanceService = async (
  id: string,
  data: { status?: AttendanceStatus; remarks?: string }
) => {
  const attendance = await Attendance.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("student", "firstName lastName enrollmentNumber")
    .populate("subject", "subjectName subjectCode");
  if (!attendance) throw new Error("Attendance record not found");
  return attendance;
};

export const deleteAttendanceService = async (id: string) => {
  const attendance = await Attendance.findByIdAndDelete(id);
  if (!attendance) throw new Error("Attendance record not found");
  return attendance;
};
