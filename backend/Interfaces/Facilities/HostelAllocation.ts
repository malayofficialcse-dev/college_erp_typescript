import { Document, Types } from "mongoose";

export type HostelAllocationStatus = "ACTIVE" | "VACATED" | "CANCELLED";

export interface IHostelAllocation extends Document {
  hostelRoom: Types.ObjectId;
  student: Types.ObjectId;
  allocationDate: Date;
  vacateDate?: Date;
  status: HostelAllocationStatus;
  remarks?: string;
}
