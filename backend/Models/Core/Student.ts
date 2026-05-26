import mongoose, { Schema } from "mongoose";
import type { IStudent } from "../../Interfaces/Core/Student.ts";

const studentSchema = new Schema<IStudent>(
  {
    enrollmentNumber: {
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
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    dateOfBirth: { type: Date, required: true },
    guardianName: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
    address: { type: String, trim: true },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    section: { type: Schema.Types.ObjectId, ref: "Section" },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear" },
    currentSemester: { type: Number, required: true, min: 1, default: 1 },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "GRADUATED", "SUSPENDED", "DROPPED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

studentSchema.index({ department: 1, currentSemester: 1, status: 1 });

export default mongoose.model<IStudent>("Student", studentSchema);
