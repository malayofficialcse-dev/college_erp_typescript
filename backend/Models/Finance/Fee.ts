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
    // Virtual-style computed field stored for quick reads by the Finance UI
    netAmount: { type: Number, default: 0, min: 0 },
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
    // Source tracking — which module created this record
    source: { type: String, trim: true, default: "DIRECT" }, // DIRECT | EMI | ADVANCE
    admissionId: { type: Schema.Types.ObjectId, ref: "Admission" },
    emiId: { type: Schema.Types.ObjectId, ref: "AdmissionEmi" },
  },
  { timestamps: true }
);

// Auto-compute netAmount before save
feeSchema.pre("save", function (next) {
  this.netAmount = Math.max((this.amount || 0) - (this.discountAmount || 0) + (this.fineAmount || 0), 0);
  next();
});

feeSchema.index({ student: 1, status: 1 });
feeSchema.index({ paymentDate: -1 });

export default mongoose.model<IFee>("Fee", feeSchema);
