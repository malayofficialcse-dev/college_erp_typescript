import { Document, Types } from "mongoose";

export type TransportAllocationStatus = "ACTIVE" | "CANCELLED";

export interface ITransportAllocation extends Document {
  route: Types.ObjectId;
  student: Types.ObjectId;
  pickupPoint?: string;
  allocationDate: Date;
  status: TransportAllocationStatus;
  remarks?: string;
}
