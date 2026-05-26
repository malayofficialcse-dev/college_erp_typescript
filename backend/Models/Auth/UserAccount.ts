import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import type { IUserAccount } from "../../Interfaces/Auth/UserAccount.ts";

const userAccountSchema = new Schema<IUserAccount>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    fullName: { type: String, required: true, trim: true },
    roles: { type: [String], default: ["ROLE_STAFF"] },
    enabled: { type: Boolean, default: true },
    employee: { type: Schema.Types.ObjectId, ref: "Employee" },
    student: { type: Schema.Types.ObjectId, ref: "Student" },
  },
  { timestamps: true }
);

userAccountSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUserAccount>("UserAccount", userAccountSchema);
