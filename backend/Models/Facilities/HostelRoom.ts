import mongoose, { Schema } from "mongoose";
import type { IHostelRoom } from "../../Interfaces/Facilities/HostelRoom.ts";

const hostelRoomSchema = new Schema<IHostelRoom>(
  {
    hostelName: { type: String, required: true, trim: true },
    roomNumber: { type: String, required: true, trim: true },
    roomType: {
      type: String,
      enum: ["SINGLE", "DOUBLE", "TRIPLE", "DORMITORY"],
      default: "DOUBLE",
    },
    capacity: { type: Number, required: true, min: 1 },
    currentOccupants: { type: Number, default: 0, min: 0 },
    monthlyRent: { type: Number, min: 0 },
    facilities: { type: String, trim: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "FULL", "MAINTENANCE"],
      default: "AVAILABLE",
    },
  },
  { timestamps: true }
);

hostelRoomSchema.index({ hostelName: 1, roomNumber: 1 }, { unique: true });

export default mongoose.model<IHostelRoom>("HostelRoom", hostelRoomSchema);
