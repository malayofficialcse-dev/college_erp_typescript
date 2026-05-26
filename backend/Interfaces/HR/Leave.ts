import { Document, Types } from "mongoose";

export type LeaveType =
  | "CASUAL"
  | "SICK"
  | "EARNED"
  | "MATERNITY"
  | "PATERNITY"
  | "UNPAID";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface ILeave extends Document {
  employee: Types.ObjectId;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: Types.ObjectId;
  remarks?: string;
}
