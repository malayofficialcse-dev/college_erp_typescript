import { Document, Types } from "mongoose";

export interface IDesignation extends Document {
  title: string;
  code: string;
  description?: string;
  department?: Types.ObjectId;
  level?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
