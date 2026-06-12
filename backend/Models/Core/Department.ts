import mongoose, { Schema, Model } from "mongoose";
import type { Idepartment } from "../../Interfaces/Core/Department.ts";

const departmentSchema = new Schema<Idepartment>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    estdYear: { type: String },
    hodName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    designations: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Department: Model<Idepartment> = mongoose.model<Idepartment>(
  "Department",
  departmentSchema
);
export default Department;
