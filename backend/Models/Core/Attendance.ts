import mongoose, { Schema } from "mongoose";
import type { IAttendance } from "../../Interfaces/Core/Attendance.ts";

const attendanceSchema = new Schema<IAttendance>(
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
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LATE", "EXCUSED"],
      default: "PRESENT",
    },
    remarks: { type: String, trim: true },
    markedBy: { type: Schema.Types.ObjectId, ref: "Teacher" },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>("Attendance", attendanceSchema);
