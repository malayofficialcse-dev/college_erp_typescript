import { Document, Types } from "mongoose";

export type StaffAttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";

export interface IStaffAttendance extends Document {
  employee: Types.ObjectId;
  date: Date;
  status: StaffAttendanceStatus;
  remarks?: string;
}
