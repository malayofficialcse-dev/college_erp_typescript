import { Document } from "mongoose";

export interface IClassroom extends Document {
  roomNumber: string;
  building: string;
  floor?: number;
  capacity: number;
  isActive: boolean;
}
