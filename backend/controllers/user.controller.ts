import type { Request, Response } from "express";
import {
    createUserService,
    getAllUserService,
    getSingleUserService,
    deleteUserService
} from "../Services/user.service.ts";
import User from "../Models/user.model.ts";
import UserPermission from "../Models/Auth/UserPermission.ts";

export const createUserController = async (req: Request,
    res: Response) => {

    try {
        const user = await createUserService(req.body);

        res.status(201).json({
            success: true,
            message: "User createdSuccessfully",
            data: user,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

export const getSingleUserController = async (req:Request,res:Response) => {
    try {
        const user = await getSingleUserService(req.params.id);

        res.status(200).json({
            success:true,
            data:user,
        });

    } catch (error : any) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

export const getUserPermissionsController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User id is required' });
    }

    const permissions = await UserPermission.find({ user: userId }).select('-__v').lean();
    res.status(200).json({ success: true, data: permissions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUserController = async (req:Request,res:Response) => {
    try {
        await deleteUserService(req.params.id);

        res.status(200).json({
            success:true,
            message:"User deleted successfully",
        });
    } catch (error : any) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

export const getAllUserController = async (req:Request,res:Response) => {
    try {
        const users = await getAllUserService();

        res.status(200).json({
            success:true,
            data:users,
        })
    } catch (error:any) {
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
}