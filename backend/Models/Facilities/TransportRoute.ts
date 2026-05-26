import mongoose, { Schema } from "mongoose";
import type { ITransportRoute } from "../../Interfaces/Facilities/TransportRoute.ts";

const transportRouteSchema = new Schema<ITransportRoute>(
  {
    routeName: { type: String, required: true, trim: true },
    startLocation: { type: String, required: true, trim: true },
    endLocation: { type: String, required: true, trim: true },
    stops: { type: String, trim: true },
    routeCost: { type: Number, min: 0 },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITransportRoute>(
  "TransportRoute",
  transportRouteSchema
);
