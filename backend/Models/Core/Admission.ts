import mongoose, { Schema } from "mongoose";
import type { IAdmission } from "../../Interfaces/Core/Admission.ts";

const admissionSchema = new Schema<IAdmission>(
  {
    admissionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    billNumber: { type: String, trim: true },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    academicYear: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    admissionDate: { type: Date, required: true, default: Date.now },
    totalFeeAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    netPayableAmount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    balanceDue: { type: Number, default: 0, min: 0 },
    paymentPlan: {
      type: String,
      enum: ["FULL", "EMI"],
      default: "FULL",
    },
    numberOfEmis: { type: Number, min: 1 },
    status: {
      type: String,
      enum: ["ACTIVE", "PENDING", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAdmission>("Admission", admissionSchema);
