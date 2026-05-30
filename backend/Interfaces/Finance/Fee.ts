import { Document, Types } from "mongoose";

export type FeeStatus = "PAID" | "UNPAID" | "PARTIAL" | "CANCELLED";
export type FeePaymentMethod =
  | "CASH"
  | "UPI"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "CARD"
  | "DD";

export type FeeSource = "DIRECT" | "EMI" | "ADVANCE" | "INVOICE";

export interface IFee extends Document {
  student: Types.ObjectId;
  feeType?: string;
  amount: number;
  discountAmount: number;
  fineAmount: number;
  netAmount?: number;
  semester?: number;
  paymentDate?: Date;
  dueDate?: Date;
  paymentMethod?: FeePaymentMethod;
  transactionId?: string;
  receiptNumber?: string;
  status: FeeStatus;
  remarks?: string;
  source?: FeeSource;
  admissionId?: Types.ObjectId;
  emiId?: Types.ObjectId;
}
