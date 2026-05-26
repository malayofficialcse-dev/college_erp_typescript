import mongoose, { Schema } from "mongoose";
import type { IExamSchedule } from "../../Interfaces/Core/ExamSchedule.ts";

const examScheduleSchema = new Schema<IExamSchedule>(
  {
    examName: { type: String, required: true, trim: true },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    subject: { type: Schema.Types.ObjectId, ref: "Subject" },
    semester: { type: Schema.Types.ObjectId, ref: "Semester" },
    semesterNumber: { type: Number, min: 1 },
    examType: {
      type: String,
      enum: ["MID_TERM", "FINAL", "PRACTICAL", "VIVA"],
      required: true,
    },
    examDate: { type: Date, required: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    classroom: { type: Schema.Types.ObjectId, ref: "Classroom" },
    status: {
      type: String,
      enum: ["SCHEDULED", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IExamSchedule>(
  "ExamSchedule",
  examScheduleSchema
);
