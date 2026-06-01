import { Document, Types } from "mongoose";

export type PayrollStatus = "UNPAID" | "PAID" | "CANCELLED";

export interface IPayroll extends Document {
  employee: Types.ObjectId;
  month: number;
  year: number;
  basicSalary: number;
  grossSalary?: number;
  hra?: number;
  da?: number;
  ta?: number;
  bonus?: number;
  otherAllowances?: number;
  allowances: number;
  pfDeduction?: number;
  taxDeduction?: number;
  esiDeduction?: number;
  otherDeductions?: number;
  deductions: number;
  netSalary: number;
  status: PayrollStatus;
  paidDate?: Date;
  transactionId?: string;
}
