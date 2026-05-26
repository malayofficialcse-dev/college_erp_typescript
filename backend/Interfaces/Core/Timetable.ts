import { Document, Types } from "mongoose";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface ITimetable extends Document {
  course: Types.ObjectId;
  subject: Types.ObjectId;
  teacher: Types.ObjectId;
  classroom?: Types.ObjectId;
  semester?: Types.ObjectId;
  section?: Types.ObjectId;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
}
