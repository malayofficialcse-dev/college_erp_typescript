import mongoose, { Schema } from "mongoose";
import type { ISubject } from "../../Interfaces/Core/Subject.ts";

const subjectSchema = new Schema<ISubject>(
  {
    subjectCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    subjectName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    semester: {
      type: Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
    semesterNumber: { type: Number, min: 1 },
    credits: { type: Number, default: 0, min: 0 },
    subjectType: {
      type: String,
      enum: ["Theory", "Practical", "Lab"],
      default: "Theory",
    },
    totalMarks: { type: Number, default: 100, min: 0 },
    passingMarks: { type: Number, default: 40, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISubject>("Subject", subjectSchema);
