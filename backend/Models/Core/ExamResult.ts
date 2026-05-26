import mongoose, { Schema } from "mongoose";
import type { IExamResult } from "../../Interfaces/Core/ExamResult.ts";

const examResultSchema = new Schema<IExamResult>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    examSchedule: { type: Schema.Types.ObjectId, ref: "ExamSchedule" },
    examType: { type: String, trim: true },
    marksObtained: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, required: true, min: 1 },
    grade: { type: String, trim: true },
    gradePoint: { type: Number, min: 0 },
    resultStatus: {
      type: String,
      enum: ["PASS", "FAIL", "ABSENT"],
      default: "PASS",
    },
    semesterNumber: { type: Number, min: 1 },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

examResultSchema.index({ student: 1, subject: 1, examType: 1 });

export default mongoose.model<IExamResult>("ExamResult", examResultSchema);
