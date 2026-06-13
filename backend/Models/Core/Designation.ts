import mongoose, { Schema, Model } from "mongoose";
import type { IDesignation } from "../../Interfaces/Core/Designation.ts";

const designationSchema = new Schema<IDesignation>(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    level: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Designation: Model<IDesignation> = mongoose.model<IDesignation>(
  "Designation",
  designationSchema
);

export default Designation;
