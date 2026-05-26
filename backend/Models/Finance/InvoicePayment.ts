import mongoose, { Schema } from "mongoose";
import type { IInvoicePayment } from "../../Interfaces/Finance/InvoicePayment.ts";

const invoicePaymentSchema = new Schema<IInvoicePayment>(
  {
    invoice: {
      type: Schema.Types.ObjectId,
      ref: "FeeInvoice",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true, default: Date.now },
    paymentMethod: {
      type: String,
      enum: ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "DD"],
      required: true,
    },
    referenceNumber: { type: String, trim: true },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IInvoicePayment>(
  "InvoicePayment",
  invoicePaymentSchema
);
