import { Document, Types } from "mongoose";

export type ExamResultStatus = "PASS" | "FAIL" | "ABSENT";

export interface IExamResult extends Document {
  student: Types.ObjectId;
  subject: Types.ObjectId;
  examSchedule?: Types.ObjectId;
  examType?: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  gradePoint?: number;
  resultStatus: ExamResultStatus;
  semesterNumber?: number;
  remarks?: string;
}
