import { Document, Types } from "mongoose";

export type TeacherStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE";

export interface ITeacher extends Document {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  qualification?: string;
  joiningDate?: Date;
  department: Types.ObjectId;
  status: TeacherStatus;
}
