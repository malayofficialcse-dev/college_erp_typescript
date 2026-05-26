import mongoose, { Schema } from "mongoose";
import type { INotice } from "../../Interfaces/Communication/Notice.ts";

const noticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    noticeType: {
      type: String,
      enum: ["GENERAL", "ACADEMIC", "EXAM", "HOLIDAY", "URGENT"],
      default: "GENERAL",
    },
    targetAudience: {
      type: String,
      enum: ["ALL", "STUDENTS", "STAFF", "TEACHERS"],
      default: "ALL",
    },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    publishDate: { type: Date, required: true, default: Date.now },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<INotice>("Notice", noticeSchema);
