import mongoose, { Schema } from "mongoose";
import type { IVehicle } from "../../Interfaces/Facilities/Vehicle.ts";

const vehicleSchema = new Schema<IVehicle>(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ["BUS", "VAN", "CAR"],
      default: "BUS",
    },
    capacity: { type: Number, required: true, min: 1 },
    driverName: { type: String, required: true, trim: true },
    driverPhone: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "MAINTENANCE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IVehicle>("Vehicle", vehicleSchema);
