import { Document } from "mongoose";

export interface IAcademicYear extends Document {
  name: string;
  code?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}
