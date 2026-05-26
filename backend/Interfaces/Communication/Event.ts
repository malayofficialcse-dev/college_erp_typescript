import { Document, Types } from "mongoose";

export type EventType =
  | "CULTURAL"
  | "SPORTS"
  | "ACADEMIC"
  | "SEMINAR"
  | "WORKSHOP";

export type EventStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface IEvent extends Document {
  title: string;
  description?: string;
  eventType: EventType;
  eventDate: Date;
  startTime?: string;
  endTime?: string;
  venue?: string;
  organizedByDept?: Types.ObjectId;
  organizerName?: string;
  status: EventStatus;
}
