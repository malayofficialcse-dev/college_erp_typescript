import { Document, Types } from "mongoose";
import type { ChequeDetails, BankTransferDetails } from "./AdmissionEmi.ts";

export type PaymentPlan = "FULL" | "EMI";
export type AdmissionStatus =
  | "ACTIVE"
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED";

export interface IAdmission extends Document {
  admissionNumber: string;
  billNumber?: string;
  student: Types.ObjectId;
  course: Types.ObjectId;
  department: Types.ObjectId;
  academicYear: Types.ObjectId;
  admissionDate: Date;
  totalFeeAmount: number;
  discountAmount: number;
  netPayableAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentPlan: PaymentPlan;
  numberOfEmis?: number;
  advanceAmount?: number;
  advancePaymentDate?: Date;
  advancePaymentMethod?: string;
  advanceTransactionId?: string;
  advanceChequeDetails?: ChequeDetails;
  advanceBankTransferDetails?: BankTransferDetails;
  status: AdmissionStatus;
  remarks?: string;
}
