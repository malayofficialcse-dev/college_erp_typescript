import { Document, Types } from "mongoose";

export type EmployeeType =
  | "TEACHING"
  | "NON_TEACHING"
  | "ADMIN"
  | "SUPPORT";

export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "TERMINATED";

export interface IEmployee extends Document {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  employeeType: EmployeeType;
  dateOfBirth?: Date;
  joiningDate?: Date;
  basicSalary?: number;
  address?: string;
  department?: Types.ObjectId;
  status: EmployeeStatus;
}
