import bcrypt from "bcrypt";
import User from "../Models/user.model.ts";

export const createUserService = async (userData:any) => {
    const existingUser = await User.findOne({
        email:userData.email,
    });

    if(existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(
        userData.password,
        10
    );

    userData.password = hashedPassword;

    const user = await User.create(userData);
    return User;
}

export const getAllUserService = async () => {
    return await User.find();
};

export const getSingleUserService = async (id: string | string[] | undefined) => {
    (userId:string) => {
        return User.findById(userId);
    }
};

export const deleteUserService = async (id: string | string[] | undefined) => {
    async (userId:string) => {
        return await User.findByIdAndDelete(userId);
    }
};