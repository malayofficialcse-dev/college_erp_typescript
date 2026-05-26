import mongoose, { Schema } from "mongoose";
import type { IEventRegistration } from "../../Interfaces/Communication/EventRegistration.ts";

const eventRegistrationSchema = new Schema<IEventRegistration>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    attendeeName: { type: String, required: true, trim: true },
    attendeeRole: {
      type: String,
      enum: ["STUDENT", "EMPLOYEE", "GUEST"],
      required: true,
    },
    student: { type: Schema.Types.ObjectId, ref: "Student" },
    employee: { type: Schema.Types.ObjectId, ref: "Employee" },
    registrationDate: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ["CONFIRMED", "PENDING", "CANCELLED"],
      default: "CONFIRMED",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IEventRegistration>(
  "EventRegistration",
  eventRegistrationSchema
);
