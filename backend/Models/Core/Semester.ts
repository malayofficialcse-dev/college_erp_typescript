import mongoose, { Schema } from "mongoose";
import type { ISemester } from "../../Interfaces/Core/Semester.ts";

const semesterSchema = new Schema<ISemester>(
  {
    name: { type: String, required: true, trim: true },
    semesterNumber: { type: Number, required: true, min: 1 },
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

semesterSchema.index(
  { academicYear: 1, semesterNumber: 1 },
  { unique: true }
);

export default mongoose.model<ISemester>("Semester", semesterSchema);
