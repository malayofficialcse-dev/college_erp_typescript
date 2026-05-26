import { Document, Types } from "mongoose";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface IAttendance extends Document {
  student: Types.ObjectId;
  subject: Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  remarks?: string;
  markedBy?: Types.ObjectId;
}
