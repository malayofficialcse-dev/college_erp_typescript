import mongoose, { Schema } from "mongoose";
import type { IPayroll } from "../../Interfaces/HR/Payroll.ts";

const payrollSchema = new Schema<IPayroll>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000 },
    basicSalary: { type: Number, required: true, min: 0 },
    grossSalary: { type: Number, min: 0 },
    hra: { type: Number, default: 0, min: 0 },
    da: { type: Number, default: 0, min: 0 },
    ta: { type: Number, default: 0, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    otherAllowances: { type: Number, default: 0, min: 0 },
    allowances: { type: Number, default: 0, min: 0 },
    pfDeduction: { type: Number, default: 0, min: 0 },
    taxDeduction: { type: Number, default: 0, min: 0 },
    esiDeduction: { type: Number, default: 0, min: 0 },
    otherDeductions: { type: Number, default: 0, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["UNPAID", "PAID", "CANCELLED"],
      default: "UNPAID",
    },
    paidDate: { type: Date },
    transactionId: { type: String, trim: true },
  },
  { timestamps: true }
);

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model<IPayroll>("Payroll", payrollSchema);
