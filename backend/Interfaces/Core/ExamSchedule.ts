import { Document, Types } from "mongoose";

export type ExamType = "MID_TERM" | "FINAL" | "PRACTICAL" | "VIVA";
export type ExamScheduleStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface IExamSchedule extends Document {
  examName: string;
  course: Types.ObjectId;
  subject?: Types.ObjectId;
  semester?: Types.ObjectId;
  semesterNumber?: number;
  examType: ExamType;
  examDate: Date;
  startTime: string;
  endTime: string;
  classroom?: Types.ObjectId;
  status: ExamScheduleStatus;
}
