import bcrypt from "bcrypt";
import mongoose, { Types } from "mongoose";
import type { IUserAccount } from "../../Interfaces/Auth/UserAccount.ts";
import UserAccount from "../../Models/Auth/UserAccount.ts";
import Employee from "../../Models/HR/Employee.ts";

type CreateUserAccountData = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roles?: string[];
  enabled?: boolean;
  employee?: Types.ObjectId;
  student?: Types.ObjectId;
};

type UpdateUserAccountData = Partial<Omit<CreateUserAccountData, "password">> & {
  password?: string;
};

class UserAccountService {
  async createUserAccount(data: CreateUserAccountData): Promise<IUserAccount> {
    const username = data.username.toUpperCase().trim();
    const email = data.email.toLowerCase().trim();

    const existing = await UserAccount.findOne({
      $or: [{ username }, { email }],
    });

    if (existing) {
      throw new Error("Username or email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return UserAccount.create({
      ...data,
      username,
      email,
      password: hashedPassword,
    });
  }

  async getUserAccountById(id: string): Promise<IUserAccount | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user account id");
    }
    return UserAccount.findById(id).select("-password");
  }

  async getAllUserAccounts(): Promise<IUserAccount[]> {
    return UserAccount.find().select("-password");
  }

  async updateUserAccount(
    id: string,
    data: UpdateUserAccountData
  ): Promise<IUserAccount | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user account id");
    }

    const updateData: UpdateUserAccountData = { ...data };
    if (data.username) {
      updateData.username = data.username.toUpperCase().trim();
    }
    if (data.email) {
      updateData.email = data.email.toLowerCase().trim();
    }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return UserAccount.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");
  }

  async deleteUserAccountById(id: string): Promise<IUserAccount | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user account id");
    }
    return UserAccount.findByIdAndDelete(id).select("-password");
  }

  async authenticate(
    usernameOrEmailOrCode: string,
    password: string
  ): Promise<IUserAccount | null> {
    const identifier = usernameOrEmailOrCode.trim();
    const normalizedEmail = identifier.toLowerCase();
    const normalizedCode = identifier.toUpperCase();

    let userAccount = await UserAccount.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedCode }],
    }).select("+password");

    if (!userAccount) {
      const employee = await Employee.findOne({
        $or: [{ email: normalizedEmail }, { employeeCode: normalizedCode }],
      });

      if (employee) {
        userAccount = await UserAccount.findOne({
          employee: employee._id,
        }).select("+password");
      }
    }

    if (!userAccount) {
      return null;
    }

    const isValid = await userAccount.comparePassword(password);
    if (!isValid) {
      return null;
    }

    userAccount.password = "";
    return userAccount;
  }
}

export default UserAccountService;
