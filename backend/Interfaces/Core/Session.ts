import { Document, Types } from "mongoose";

export interface ISession extends Document {
  label: string;
  academicYear: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}
