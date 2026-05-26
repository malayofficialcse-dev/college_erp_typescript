import { Document, Types } from "mongoose";

export type PayrollStatus = "UNPAID" | "PAID" | "CANCELLED";

export interface IPayroll extends Document {
  employee: Types.ObjectId;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: PayrollStatus;
  paidDate?: Date;
  transactionId?: string;
}
