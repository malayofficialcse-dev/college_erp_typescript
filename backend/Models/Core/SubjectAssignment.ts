import mongoose, { Schema } from "mongoose";
import type { ISubjectAssignment } from "../../Interfaces/Core/SubjectAssignment.ts";

const subjectAssignmentSchema = new Schema<ISubjectAssignment>(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
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
    section: { type: Schema.Types.ObjectId, ref: "Section" },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

subjectAssignmentSchema.index(
  { teacher: 1, subject: 1, semester: 1, section: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model<ISubjectAssignment>(
  "SubjectAssignment",
  subjectAssignmentSchema
);
