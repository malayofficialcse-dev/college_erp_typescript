import { Document, Types } from "mongoose";

export type NoticeType = "GENERAL" | "ACADEMIC" | "EXAM" | "HOLIDAY" | "URGENT";
export type TargetAudience = "ALL" | "STUDENTS" | "STAFF" | "TEACHERS";

export interface INotice extends Document {
  title: string;
  content: string;
  noticeType: NoticeType;
  targetAudience: TargetAudience;
  department?: Types.ObjectId;
  publishDate: Date;
  expiryDate?: Date;
  isActive: boolean;
}
