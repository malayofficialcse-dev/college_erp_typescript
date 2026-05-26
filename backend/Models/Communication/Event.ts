import mongoose, { Schema } from "mongoose";
import type { IEvent } from "../../Interfaces/Communication/Event.ts";

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    eventType: {
      type: String,
      enum: ["CULTURAL", "SPORTS", "ACADEMIC", "SEMINAR", "WORKSHOP"],
      default: "CULTURAL",
    },
    eventDate: { type: Date, required: true },
    startTime: { type: String, trim: true },
    endTime: { type: String, trim: true },
    venue: { type: String, trim: true },
    organizedByDept: { type: Schema.Types.ObjectId, ref: "Department" },
    organizerName: { type: String, trim: true },
    status: {
      type: String,
      enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>("Event", eventSchema);
