import mongoose, { Schema } from "mongoose";
import type { IResignation } from "../../Interfaces/HR/Resignation.ts";

const resignationSchema = new Schema<IResignation>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    lastWorkingDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"],
      default: "PENDING",
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "Employee" },
    reviewRemarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IResignation>("Resignation", resignationSchema);
