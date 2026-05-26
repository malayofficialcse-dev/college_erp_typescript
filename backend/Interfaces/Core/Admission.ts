import { Document, Types } from "mongoose";

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
  status: AdmissionStatus;
  remarks?: string;
}
