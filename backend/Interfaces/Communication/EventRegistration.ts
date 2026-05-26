import { Document, Types } from "mongoose";

export type AttendeeRole = "STUDENT" | "EMPLOYEE" | "GUEST";
export type RegistrationStatus = "CONFIRMED" | "PENDING" | "CANCELLED";

export interface IEventRegistration extends Document {
  event: Types.ObjectId;
  attendeeName: string;
  attendeeRole: AttendeeRole;
  student?: Types.ObjectId;
  employee?: Types.ObjectId;
  registrationDate: Date;
  status: RegistrationStatus;
}
