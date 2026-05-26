import { Document, Types } from "mongoose";

export type BorrowerType = "STUDENT" | "EMPLOYEE" | "TEACHER";
export type ReservationStatus = "PENDING" | "FULFILLED" | "CANCELLED";

export interface IBookReservation extends Document {
  book: Types.ObjectId;
  borrowerName: string;
  borrowerType: BorrowerType;
  student?: Types.ObjectId;
  employee?: Types.ObjectId;
  reservationDate: Date;
  status: ReservationStatus;
  remarks?: string;
}
