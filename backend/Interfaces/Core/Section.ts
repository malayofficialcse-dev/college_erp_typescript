import { Document, Types } from "mongoose";

export interface ISection extends Document {
  name: string;
  code: string;
  department: Types.ObjectId;
  course: Types.ObjectId;
  semester: Types.ObjectId;
  academicYear?: Types.ObjectId;
  capacity: number;
  classTeacher?: Types.ObjectId;
  isActive: boolean;
}
