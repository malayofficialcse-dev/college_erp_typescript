import mongoose, { Schema } from "mongoose";
import type { IBook } from "../../Interfaces/Facilities/Book.ts";

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, trim: true, sparse: true, unique: true },
    publisher: { type: String, trim: true },
    category: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 1 },
    available: { type: Number, required: true, min: 0, default: 1 },
    location: { type: String, trim: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "NOT_AVAILABLE", "DISCONTINUED"],
      default: "AVAILABLE",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBook>("Book", bookSchema);
