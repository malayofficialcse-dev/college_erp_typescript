import { Document } from "mongoose";

export type RoomType = "LECTURE" | "LAB" | "SEMINAR" | "AUDITORIUM";

export interface IClassroom extends Document {
  roomNumber: string;
  building: string;
  floor?: number;
  capacity: number;
  roomType: RoomType;
  isActive: boolean;
}
