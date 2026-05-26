import { Document, Types } from "mongoose";

export type CourseType =
  | "UNDERGRADUATE"
  | "POSTGRADUATE"
  | "DIPLOMA"
  | "CERTIFICATE";

export type CourseStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export default interface ICourse extends Document {
  name: string;
  code: string;
  department: Types.ObjectId;
  duration: string;
  durationYears?: number;
  totalSemesters?: number;
  credits?: number;
  fees: number;
  courseType?: CourseType;
  status?: CourseStatus;
  description?: string;
  isActive: boolean;
}
