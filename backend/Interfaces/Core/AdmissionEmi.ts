import { Document, Types } from "mongoose";

export type EmiStatus = "PENDING" | "PAID" | "OVERDUE" | "WAIVED";
export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "DD";

export interface IAdmissionEmi extends Document {
  admission: Types.ObjectId;
  emiNumber: number;
  emiAmount: number;
  dueDate: Date;
  paidAmount: number;
  paidDate?: Date;
  fineAmount: number;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  receiptNumber?: string;
  status: EmiStatus;
  remarks?: string;
}
