import mongoose, { Schema } from "mongoose";
import type { IFee } from "../../Interfaces/Finance/Fee.ts";

const feeSchema = new Schema<IFee>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    feeType: { type: String, trim: true, default: "Tuition Fee" },
    amount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    fineAmount: { type: Number, default: 0, min: 0 },
    semester: { type: Number, min: 1 },
    paymentDate: { type: Date },
    dueDate: { type: Date },
    paymentMethod: {
      type: String,
      enum: ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "DD"],
    },
    transactionId: { type: String, trim: true },
    receiptNumber: { type: String, trim: true, unique: true, sparse: true },
    status: {
      type: String,
      enum: ["PAID", "UNPAID", "PARTIAL", "CANCELLED"],
      default: "UNPAID",
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IFee>("Fee", feeSchema);
