import { Document } from "mongoose";

interface Idepartment extends Document {
  name: string;
  code: string;
  description?: string;
  estdYear?: string;
  hodName?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}

export type { Idepartment };
