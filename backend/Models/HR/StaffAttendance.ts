import mongoose, { Schema } from "mongoose";
import type { IStaffAttendance } from "../../Interfaces/HR/StaffAttendance.ts";

const staffAttendanceSchema = new Schema<IStaffAttendance>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LATE", "HALF_DAY"],
      default: "PRESENT",
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

staffAttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model<IStaffAttendance>(
  "StaffAttendance",
  staffAttendanceSchema
);
