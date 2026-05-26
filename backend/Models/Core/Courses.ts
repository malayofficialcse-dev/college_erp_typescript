import mongoose, { Schema, Model } from "mongoose";
import type ICourse from "../../Interfaces/Core/Courses.ts";

const courseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    duration: { type: String, required: true },
    durationYears: { type: Number, min: 1 },
    totalSemesters: { type: Number, min: 1, default: 8 },
    credits: { type: Number, min: 0 },
    fees: { type: Number, required: true, min: 0 },
    courseType: {
      type: String,
      enum: ["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA", "CERTIFICATE"],
      default: "UNDERGRADUATE",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Course: Model<ICourse> = mongoose.model<ICourse>("Course", courseSchema);
export default Course;
