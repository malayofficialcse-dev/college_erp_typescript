import { Document, Types } from "mongoose";

export type StudentGender = "Male" | "Female" | "Other";
export type StudentStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "GRADUATED"
  | "SUSPENDED"
  | "DROPPED";

export interface IStudent extends Document {
  enrollmentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: StudentGender;
  dateOfBirth: Date;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  department: Types.ObjectId;
  course?: Types.ObjectId;
  section?: Types.ObjectId;
  academicYear?: Types.ObjectId;
  currentSemester: number;
  status: StudentStatus;
}
