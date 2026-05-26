import { Document, Types } from "mongoose";

export type SubjectType = "Theory" | "Practical" | "Lab";

export interface ISubject extends Document {
  subjectCode: string;
  subjectName: string;
  description?: string;
  department: Types.ObjectId;
  course: Types.ObjectId;
  semester: Types.ObjectId;
  teacher?: Types.ObjectId;
  semesterNumber?: number;
  credits: number;
  subjectType: SubjectType;
  totalMarks: number;
  passingMarks: number;
  isActive: boolean;
}
