import mongoose, { Schema } from "mongoose";
import type { IHostelAllocation } from "../../Interfaces/Facilities/HostelAllocation.ts";

const hostelAllocationSchema = new Schema<IHostelAllocation>(
  {
    hostelRoom: {
      type: Schema.Types.ObjectId,
      ref: "HostelRoom",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    allocationDate: { type: Date, required: true, default: Date.now },
    vacateDate: { type: Date },
    status: {
      type: String,
      enum: ["ACTIVE", "VACATED", "CANCELLED"],
      default: "ACTIVE",
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IHostelAllocation>(
  "HostelAllocation",
  hostelAllocationSchema
);
