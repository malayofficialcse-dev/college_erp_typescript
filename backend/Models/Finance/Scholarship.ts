import mongoose, { Schema } from "mongoose";
import type { IScholarship } from "../../Interfaces/Finance/Scholarship.ts";

const scholarshipSchema = new Schema<IScholarship>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    scholarshipName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    provider: { type: String, trim: true },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear" },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "REVOKED"],
      default: "ACTIVE",
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IScholarship>("Scholarship", scholarshipSchema);
