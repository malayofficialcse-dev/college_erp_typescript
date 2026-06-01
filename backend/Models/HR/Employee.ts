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
    dateOfBirth: { type: Date },
    joiningDate: { type: Date },
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
    address: { type: String, trim: true },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IEmployee>("Employee", employeeSchema);
