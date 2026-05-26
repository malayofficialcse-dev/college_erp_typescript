import { Document } from "mongoose";

export type BookStatus = "AVAILABLE" | "NOT_AVAILABLE" | "DISCONTINUED";

export interface IBook extends Document {
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  category?: string;
  quantity: number;
  available: number;
  location?: string;
  status: BookStatus;
}
