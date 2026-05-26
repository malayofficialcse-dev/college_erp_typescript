import mongoose, { Schema } from "mongoose";
import type { ITransportAllocation } from "../../Interfaces/Facilities/TransportAllocation.ts";

const transportAllocationSchema = new Schema<ITransportAllocation>(
  {
    route: {
      type: Schema.Types.ObjectId,
      ref: "TransportRoute",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    pickupPoint: { type: String, trim: true },
    allocationDate: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED"],
      default: "ACTIVE",
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITransportAllocation>(
  "TransportAllocation",
  transportAllocationSchema
);
