import { IUser } from "../../Interfaces/user.interface.ts";
import User from "../../Models/user.model.ts";

type CreateUserData = Pick<IUser, "name" | "address" | "email" | "password" | "phone">;
type UpdateUserData = Partial<CreateUserData>;

class UserService {
    async createUser(data: CreateUserData): Promise<IUser> {
        try {
            const user = new User(data);
            return await user.save();
        } catch (error) {
            throw new Error (
                `FAILED TO CREATE USER ${error instanceof Error ? error.message:"unknown error"}`
            );
        }
    }

    async getUserById(id:string) : Promise<IUser | null> {
        try {
            return await User.findById(id);
        } catch (error) {
            throw new Error (
                `Failed to fetch user : ${error instanceof Error ? error.message : "unknown error"}`
            );
        }
    }

    async getAllUsers() : Promise<IUser[]> {
        try {
            return await User.find();
        } catch (error) {
            throw new Error (
                `Failed to fetch all users ${error instanceof Error ? error.message :"unknown error"}`
            );
        }
    }

    async updateUser(id: string, data: UpdateUserData): Promise<IUser | null> {
        try {
            return await User.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            });
        } catch (error) {
            throw new Error(
                `Failed to update user : ${error instanceof Error ? error.message : "unknown error"}`
            );
        }
    }

    async deleteUserById(id:string) : Promise<IUser | null> {
        try {
            return await User.findByIdAndDelete(id);
        } catch (error) {
            throw new Error (
                `Failed to delete the user : ${error instanceof Error ? error.message : "unknown error"}`
            );
        }
    }
}

export default UserService;