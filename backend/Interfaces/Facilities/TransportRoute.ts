import { Document, Types } from "mongoose";

export type TransportRouteStatus = "ACTIVE" | "INACTIVE";

export interface ITransportRoute extends Document {
  routeName: string;
  startLocation: string;
  endLocation: string;
  stops?: string;
  routeCost?: number;
  vehicle?: Types.ObjectId;
  status: TransportRouteStatus;
}
