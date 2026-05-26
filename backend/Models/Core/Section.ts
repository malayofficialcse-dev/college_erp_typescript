import mongoose, { Schema } from "mongoose";
import type { ISection } from "../../Interfaces/Core/Section.ts";

const sectionSchema = new Schema<ISection>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
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
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear" },
    capacity: { type: Number, required: true, min: 1, default: 60 },
    classTeacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISection>("Section", sectionSchema);
