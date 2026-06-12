import mongoose, { Schema } from "mongoose";
import type { IEmployee } from "../../Interfaces/HR/Employee.ts";

const employeeSchema = new Schema<IEmployee>(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    employeeType: {
      type: String,
      enum: ["TEACHING", "NON_TEACHING", "ADMIN", "SUPPORT"],
      default: "TEACHING",
    },

    // Personal details
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
    bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    maritalStatus: { type: String, enum: ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"] },
    nationality: { type: String, trim: true, default: "Indian" },
    address: { type: String, trim: true },

    // Emergency contact
    emergencyContactName: { type: String, trim: true },
    emergencyContactPhone: { type: String, trim: true },
    emergencyContactRelation: { type: String, trim: true },

    // Identity
    panNumber: { type: String, trim: true, uppercase: true },
    aadharNumber: { type: String, trim: true },

    // Professional
    joiningDate: { type: Date },
    relievingDate: { type: Date },
    contractType: {
      type: String,
      enum: ["PERMANENT", "CONTRACT", "TEMPORARY", "PROBATION"],
      default: "PERMANENT",
    },
    contractEndDate: { type: Date },
    probationEndDate: { type: Date },

    // Qualifications
    qualifications: [{ type: String, trim: true }],

    // Bank details
    bankName: { type: String, trim: true },
    bankAccountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true, uppercase: true },

    // Salary
    basicSalary: { type: Number, min: 0 },
    hra: { type: Number, default: 0, min: 0 },
    da: { type: Number, default: 0, min: 0 },
    ta: { type: Number, default: 0, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    otherAllowances: { type: Number, default: 0, min: 0 },
    pfDeduction: { type: Number, default: 0, min: 0 },
    taxDeduction: { type: Number, default: 0, min: 0 },
    esiDeduction: { type: Number, default: 0, min: 0 },
    otherDeductions: { type: Number, default: 0, min: 0 },

    department: { type: Schema.Types.ObjectId, ref: "Department" },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED", "RESIGNED", "RETIRED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IEmployee>("Employee", employeeSchema);
