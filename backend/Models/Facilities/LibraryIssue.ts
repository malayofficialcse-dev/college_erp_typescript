import mongoose, { Schema } from "mongoose";
import type { ILibraryIssue } from "../../Interfaces/Facilities/LibraryIssue.ts";

const libraryIssueSchema = new Schema<ILibraryIssue>(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    fineAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["ISSUED", "RETURNED", "OVERDUE", "LOST"],
      default: "ISSUED",
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILibraryIssue>("LibraryIssue", libraryIssueSchema);
