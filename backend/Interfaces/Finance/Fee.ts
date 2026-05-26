import { Document, Types } from "mongoose";

export type FeeStatus = "PAID" | "UNPAID" | "PARTIAL" | "CANCELLED";
export type FeePaymentMethod =
  | "CASH"
  | "UPI"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "DD";

export interface IFee extends Document {
  student: Types.ObjectId;
  feeType?: string;
  amount: number;
  discountAmount: number;
  fineAmount: number;
  semester?: number;
  paymentDate?: Date;
  dueDate?: Date;
  paymentMethod?: FeePaymentMethod;
  transactionId?: string;
  receiptNumber?: string;
  status: FeeStatus;
  remarks?: string;
}
