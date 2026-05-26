import { Document, Types } from "mongoose";

export type CounselingStatus =
  | "PENDING"
  | "CONTACTED"
  | "ADMITTED"
  | "REJECTED";

export interface ICounseling extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender?: "Male" | "Female" | "Other";
  dateOfBirth?: Date;
  previousQualification?: string;
  desiredCourse?: Types.ObjectId;
  counselorName?: string;
  remarks?: string;
  status: CounselingStatus;
}
