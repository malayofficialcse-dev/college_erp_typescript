import mongoose, { Schema } from "mongoose";
import type { IAdmissionEmi } from "../../Interfaces/Core/AdmissionEmi.ts";

const admissionEmiSchema = new Schema<IAdmissionEmi>(
  {
    admission: {
      type: Schema.Types.ObjectId,
      ref: "Admission",
      required: true,
    },
    emiNumber: { type: Number, required: true, min: 1 },
    emiAmount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    paidAmount: { type: Number, default: 0, min: 0 },
    paidDate: { type: Date },
    fineAmount: { type: Number, default: 0, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "DD"],
    },
    transactionId: { type: String, trim: true },
    receiptNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "OVERDUE", "WAIVED"],
      default: "PENDING",
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

admissionEmiSchema.index({ admission: 1, emiNumber: 1 }, { unique: true });

export default mongoose.model<IAdmissionEmi>(
  "AdmissionEmi",
  admissionEmiSchema
);
