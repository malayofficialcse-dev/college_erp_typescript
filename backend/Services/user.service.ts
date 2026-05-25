import bcrypt from "bcrypt";
import User from "../Models/user.model.ts";

export const createUserService = async (userData: {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: unknown;
}) => {
  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = await User.create({
    ...userData,
    password: hashedPassword,
  });

  return user;
};

export const getAllUserService = async () => {
  return User.find().select("-password");
};

export const getSingleUserService = async (
  id: string | string[] | undefined
) => {
  const userId = Array.isArray(id) ? id[0] : id;
  if (!userId) {
    throw new Error("User id is required");
  }
  return User.findById(userId).select("-password");
};

export const deleteUserService = async (
  id: string | string[] | undefined
) => {
  const userId = Array.isArray(id) ? id[0] : id;
  if (!userId) {
    throw new Error("User id is required");
  }
  return User.findByIdAndDelete(userId);
};
