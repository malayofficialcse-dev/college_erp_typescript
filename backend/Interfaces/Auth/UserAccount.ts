import { Document, Types } from "mongoose";

export interface IUserAccount extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roles: string[];
  enabled: boolean;
  department?: Types.ObjectId;
  employee?: Types.ObjectId;
  student?: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
