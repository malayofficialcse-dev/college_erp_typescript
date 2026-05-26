import { Document, Types } from "mongoose";

export type ResignationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface IResignation extends Document {
  employee: Types.ObjectId;
  lastWorkingDate: Date;
  reason: string;
  status: ResignationStatus;
  reviewedBy?: Types.ObjectId;
  reviewRemarks?: string;
}
