import { Document, Types } from "mongoose";

export type EmiStatus = "PENDING" | "PAID" | "OVERDUE" | "WAIVED" | "PARTIAL";
export type PaymentMethod = "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE" | "CARD";

export interface ChequeDetails {
  bankName: string;
  holderName: string;
  chequeNumber: string;
  chequeDate: Date;
}

export interface BankTransferDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
}

export interface IAdmissionEmi extends Document {
  admission: Types.ObjectId;
  emiNumber: number;
  emiAmount: number;
  dueDate: Date;
  paidAmount: number;
  paidDate?: Date;
  fineAmount: number;
  semester?: number;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  receiptNumber?: string;
  status: EmiStatus;
  remarks?: string;
  carryOverAmount: number;
  chequeDetails?: ChequeDetails;
  bankTransferDetails?: BankTransferDetails;
}
