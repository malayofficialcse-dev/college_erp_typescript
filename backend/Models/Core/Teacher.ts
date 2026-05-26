import mongoose, { Schema } from "mongoose";
import type { ITeacher } from "../../Interfaces/Core/Teacher.ts";

const teacherSchema = new Schema<ITeacher>(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    qualification: { type: String, trim: true },
    joiningDate: { type: Date },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ON_LEAVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITeacher>("Teacher", teacherSchema);
