import { Document, Types } from "mongoose";

export type ApprovalStepStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ILeaveApprovalStep extends Document {
  leave: Types.ObjectId;
  approver: Types.ObjectId;
  stepOrder: number;
  status: ApprovalStepStatus;
  remarks?: string;
  actionDate?: Date;
}
