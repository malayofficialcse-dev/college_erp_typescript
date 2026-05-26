import { Document, Types } from "mongoose";

export type ScholarshipStatus = "ACTIVE" | "EXPIRED" | "REVOKED";

export interface IScholarship extends Document {
  student: Types.ObjectId;
  scholarshipName: string;
  amount: number;
  provider?: string;
  academicYear?: Types.ObjectId;
  status: ScholarshipStatus;
  remarks?: string;
}
