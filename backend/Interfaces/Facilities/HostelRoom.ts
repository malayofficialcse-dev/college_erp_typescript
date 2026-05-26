import { Document } from "mongoose";

export type HostelRoomType = "SINGLE" | "DOUBLE" | "TRIPLE" | "DORMITORY";
export type HostelRoomStatus = "AVAILABLE" | "FULL" | "MAINTENANCE";

export interface IHostelRoom extends Document {
  hostelName: string;
  roomNumber: string;
  roomType: HostelRoomType;
  capacity: number;
  currentOccupants: number;
  monthlyRent?: number;
  facilities?: string;
  status: HostelRoomStatus;
}
