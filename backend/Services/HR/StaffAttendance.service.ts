import StaffAttendance from "../../Models/HR/StaffAttendance.ts";
import type { StaffAttendanceStatus } from "../../Interfaces/HR/index.ts";

export interface ICreateStaffAttendanceInput {
  employee: string;
  date: Date;
  status?: StaffAttendanceStatus;
  remarks?: string;
}

export const markStaffAttendanceService = async (
  data: ICreateStaffAttendanceInput
) => {
  const existing = await StaffAttendance.findOne({
    employee: data.employee,
    date: data.date,
  });
  if (existing) {
    throw new Error("Attendance already marked for this employee on this date");
  }
  return StaffAttendance.create(data);
};

export const getAllStaffAttendanceService = async (filter: {
  employee?: string;
  date?: Date;
  status?: string;
  month?: number;
  year?: number;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.employee) query.employee = filter.employee;
  if (filter.status) query.status = filter.status;

  if (filter.date) {
    query.date = filter.date;
  } else if (filter.month !== undefined && filter.year !== undefined) {
    const start = new Date(filter.year, filter.month - 1, 1);
    const end = new Date(filter.year, filter.month, 1);
    query.date = { $gte: start, $lt: end };
  }

  return StaffAttendance.find(query)
    .populate("employee", "firstName lastName employeeCode designation")
    .sort({ date: -1 });
};

export const getStaffAttendanceByIdService = async (id: string) => {
  return StaffAttendance.findById(id).populate(
    "employee",
    "firstName lastName employeeCode designation"
  );
};

export const updateStaffAttendanceService = async (
  id: string,
  data: { status?: StaffAttendanceStatus; remarks?: string }
) => {
  const attendance = await StaffAttendance.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("employee", "firstName lastName employeeCode designation");

  if (!attendance) {
    throw new Error("Attendance record not found");
  }
  return attendance;
};

export const deleteStaffAttendanceService = async (id: string) => {
  const attendance = await StaffAttendance.findByIdAndDelete(id);
  if (!attendance) {
    throw new Error("Attendance record not found");
  }
  return attendance;
};
