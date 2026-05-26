import { Document, Types } from "mongoose";

export interface ISubjectAssignment extends Document {
  teacher: Types.ObjectId;
  subject: Types.ObjectId;
  course: Types.ObjectId;
  semester: Types.ObjectId;
  section?: Types.ObjectId;
  academicYear?: Types.ObjectId;
  isActive: boolean;
}
