import { Document, Types } from "mongoose";

export type LibraryIssueStatus = "ISSUED" | "RETURNED" | "OVERDUE" | "LOST";

export interface ILibraryIssue extends Document {
  book: Types.ObjectId;
  student: Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  returnDate?: Date;
  fineAmount: number;
  status: LibraryIssueStatus;
  remarks?: string;
}
