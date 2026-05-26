import mongoose, { Schema } from "mongoose";
import type { IBookReservation } from "../../Interfaces/Facilities/BookReservation.ts";

const bookReservationSchema = new Schema<IBookReservation>(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    borrowerName: { type: String, required: true, trim: true },
    borrowerType: {
      type: String,
      enum: ["STUDENT", "EMPLOYEE", "TEACHER"],
      required: true,
    },
    student: { type: Schema.Types.ObjectId, ref: "Student" },
    employee: { type: Schema.Types.ObjectId, ref: "Employee" },
    reservationDate: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ["PENDING", "FULFILLED", "CANCELLED"],
      default: "PENDING",
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBookReservation>(
  "BookReservation",
  bookReservationSchema
);
