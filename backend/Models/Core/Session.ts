import mongoose, { Schema, Types } from "mongoose";
import type { ISession } from "../../Interfaces/Core/Session.ts";

const sessionSchema = new Schema<ISession>(
  {
    label: { type: String, required: true, trim: true },
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ISession>("Session", sessionSchema);
