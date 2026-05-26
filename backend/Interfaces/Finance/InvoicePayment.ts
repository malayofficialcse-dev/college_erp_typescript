import { Document, Types } from "mongoose";

export type InvoicePaymentMethod =
  | "CASH"
  | "UPI"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "DD";

export interface IInvoicePayment extends Document {
  invoice: Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: InvoicePaymentMethod;
  referenceNumber?: string;
  remarks?: string;
}
