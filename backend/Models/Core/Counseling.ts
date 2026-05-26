import mongoose, { Schema } from "mongoose";
import type { ICounseling } from "../../Interfaces/Core/Counseling.ts";

const counselingSchema = new Schema<ICounseling>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    dateOfBirth: { type: Date },
    previousQualification: { type: String, trim: true },
    desiredCourse: { type: Schema.Types.ObjectId, ref: "Course" },
    counselorName: { type: String, trim: true },
    remarks: { type: String, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "CONTACTED", "ADMITTED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICounseling>("Counseling", counselingSchema);
