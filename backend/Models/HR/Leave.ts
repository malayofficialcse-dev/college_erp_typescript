import mongoose, { Schema } from "mongoose";
import type { ILeave } from "../../Interfaces/HR/Leave.ts";

const leaveSchema = new Schema<ILeave>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["CASUAL", "SICK", "EARNED", "MATERNITY", "PATERNITY", "UNPAID"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Employee" },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILeave>("Leave", leaveSchema);
