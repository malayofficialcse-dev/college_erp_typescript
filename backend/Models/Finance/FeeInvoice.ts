import mongoose, { Schema } from "mongoose";
import type { IFeeInvoice } from "../../Interfaces/Finance/FeeInvoice.ts";

const feeInvoiceSchema = new Schema<IFeeInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    dueDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["UNPAID", "PARTIAL", "PAID", "CANCELLED"],
      default: "UNPAID",
    },
    description: { type: String, trim: true },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IFeeInvoice>("FeeInvoice", feeInvoiceSchema);
