import bcrypt from "bcrypt";
import mongoose, { Types } from "mongoose";
import type { IUserAccount } from "../../Interfaces/Auth/UserAccount.ts";
import UserAccount from "../../Models/Auth/UserAccount.ts";

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
    try {
      const existing = await UserAccount.findOne({
        $or: [{ username: data.username }, { email: data.email }],
      });

      if (existing) {
        throw new Error("Username or email already exists");
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const userAccount = await UserAccount.create({
        ...data,
        password: hashedPassword,
      });

      return userAccount;
    } catch (error) {
      throw new Error(
        `FAILED TO CREATE USER ACCOUNT ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }

  async getUserAccountById(id: string): Promise<IUserAccount | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid user account id");
      }

      return await UserAccount.findById(id).select("-password");
    } catch (error) {
      throw new Error(
        `FAILED TO FETCH USER ACCOUNT ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }

  async getUserAccountByUsername(username: string): Promise<IUserAccount | null> {
    try {
      return await UserAccount.findOne({ username }).select("-password");
    } catch (error) {
      throw new Error(
        `FAILED TO FETCH USER ACCOUNT BY USERNAME ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }

  async getUserAccountByEmail(email: string): Promise<IUserAccount | null> {
    try {
      return await UserAccount.findOne({ email }).select("-password");
    } catch (error) {
      throw new Error(
        `FAILED TO FETCH USER ACCOUNT BY EMAIL ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }

  async getAllUserAccounts(): Promise<IUserAccount[]> {
    try {
      return await UserAccount.find().select("-password");
    } catch (error) {
      throw new Error(
        `FAILED TO FETCH USER ACCOUNTS ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }

  async updateUserAccount(id: string, data: UpdateUserAccountData): Promise<IUserAccount | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid user account id");
      }

      const updateData = { ...data };
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
      }

      return await UserAccount.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");
    } catch (error) {
      throw new Error(
        `FAILED TO UPDATE USER ACCOUNT ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }

  async deleteUserAccountById(id: string): Promise<IUserAccount | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid user account id");
      }

      return await UserAccount.findByIdAndDelete(id).select("-password");
    } catch (error) {
      throw new Error(
        `FAILED TO DELETE USER ACCOUNT ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }

  async authenticate(usernameOrEmailOrCode: string, password: string): Promise<IUserAccount | null> {
    try {
      // Support login with username, email, or employee code
      const query = usernameOrEmailOrCode.includes("@")
        ? { email: usernameOrEmailOrCode }
        : { $or: [{ username: usernameOrEmailOrCode }] };

      const userAccount = await UserAccount.findOne(query).select("+password");
      if (!userAccount) {
        return null;
      }

      const isValid = await userAccount.comparePassword(password);
      if (!isValid) {
        return null;
      }

      return userAccount;
    } catch (error) {
      throw new Error(
        `FAILED TO AUTHENTICATE USER ACCOUNT ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }
}

export default UserAccountService;
