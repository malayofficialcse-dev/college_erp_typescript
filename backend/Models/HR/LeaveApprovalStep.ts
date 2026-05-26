import mongoose, { Schema } from "mongoose";
import type { ILeaveApprovalStep } from "../../Interfaces/HR/LeaveApprovalStep.ts";

const leaveApprovalStepSchema = new Schema<ILeaveApprovalStep>(
  {
    leave: {
      type: Schema.Types.ObjectId,
      ref: "Leave",
      required: true,
    },
    approver: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    stepOrder: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    remarks: { type: String, trim: true },
    actionDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ILeaveApprovalStep>(
  "LeaveApprovalStep",
  leaveApprovalStepSchema
);
