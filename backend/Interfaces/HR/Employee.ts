import { Document, Types } from "mongoose";

export type EmployeeType =
  | "TEACHING"
  | "NON_TEACHING"
  | "ADMIN"
  | "SUPPORT";

export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "TERMINATED" | "RESIGNED" | "RETIRED";

export type ContractType = "PERMANENT" | "CONTRACT" | "TEMPORARY" | "PROBATION";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";

export interface IEmployee extends Document {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  employeeType: EmployeeType;

  // Personal details
  dateOfBirth?: Date;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  maritalStatus?: MaritalStatus;
  nationality?: string;
  address?: string;

  // Emergency contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  // Identity documents
  panNumber?: string;
  aadharNumber?: string;

  // Professional details
  joiningDate?: Date;
  relievingDate?: Date;
  contractType?: ContractType;
  contractEndDate?: Date;
  probationEndDate?: Date;

  // Qualifications
  qualifications?: string[];

  // Bank details
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;

  // Salary
  basicSalary?: number;
  hra?: number;
  da?: number;
  ta?: number;
  bonus?: number;
  otherAllowances?: number;
  pfDeduction?: number;
  taxDeduction?: number;
  esiDeduction?: number;
  otherDeductions?: number;

  department?: Types.ObjectId;
  status: EmployeeStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
