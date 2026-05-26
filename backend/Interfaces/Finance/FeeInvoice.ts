import { Document, Types } from "mongoose";

export type InvoiceStatus = "UNPAID" | "PARTIAL" | "PAID" | "CANCELLED";

export interface IFeeInvoice extends Document {
  invoiceNumber: string;
  student: Types.ObjectId;
  dueDate: Date;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  description?: string;
  remarks?: string;
}
