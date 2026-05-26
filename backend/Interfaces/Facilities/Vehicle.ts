import { Document } from "mongoose";

export type VehicleType = "BUS" | "VAN" | "CAR";
export type VehicleStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

export interface IVehicle extends Document {
  vehicleNumber: string;
  vehicleType: VehicleType;
  capacity: number;
  driverName: string;
  driverPhone: string;
  status: VehicleStatus;
}
