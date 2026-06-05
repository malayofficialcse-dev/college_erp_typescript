import type { Request, Response } from "express";
import UserAccountService from "../Services/Auth/UserAccount.ts";
import UserPermission from "../Models/Auth/UserPermission.ts";
import { resolveUserPermissions } from "../Services/Auth/UserPermission.service.ts";
import UserAccount from "../Models/Auth/UserAccount.ts";

const userAccountService = new UserAccountService();

export const createUserController = async (req: Request, res: Response) => {
  try {
    const user = await userAccountService.createUserAccount(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const user = await userAccountService.updateUserAccount(req.params.id, req.body);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSingleUserController = async (req: Request, res: Response) => {
  try {
    const user = await userAccountService.getUserAccountById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserEmployeeController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User id is required" });
    }

    const user = await UserAccount.findById(userId).populate({
      path: "employee",
      populate: { path: "department", select: "name code" },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.employee) {
      return res.status(404).json({
        success: false,
        message: "No employee profile linked to this account",
      });
    }

    res.status(200).json({ success: true, data: user.employee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserStudentController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User id is required" });
    }

    const user = await UserAccount.findById(userId).populate({
      path: "student",
      populate: [
        { path: "department", select: "name code" },
        { path: "course", select: "name code" },
        { path: "section", select: "name" },
        { path: "academicYear", select: "name" },
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.student) {
      return res.status(404).json({
        success: false,
        message: "No student profile linked to this account",
      });
    }

    res.status(200).json({ success: true, data: user.student });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserPermissionsController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User id is required" });
    }

    const permissions = await UserPermission.find({ user: userId })
      .select("-__v")
      .lean();
    const user = await UserAccount.findById(userId).select("roles").lean();

    res.status(200).json({
      success: true,
      data: resolveUserPermissions(permissions, user?.roles || []),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserPermissionsController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User id is required" });
    }

    const permissions = req.body;
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ success: false, message: "Permissions payload must be an array" });
    }

    const updatedPermissions = await Promise.all(
      permissions.map(async (permission) => {
        const { moduleName, canView, canCreate, canEdit, canDelete } = permission;
        return UserPermission.findOneAndUpdate(
          { user: userId, moduleName },
          {
            user: userId,
            moduleName,
            canView: !!canView,
            canCreate: !!canCreate,
            canEdit: !!canEdit,
            canDelete: !!canDelete,
          },
          { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        ).lean();
      })
    );

    res.status(200).json({ success: true, data: updatedPermissions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const user = await userAccountService.deleteUserAccountById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllUserController = async (req: Request, res: Response) => {
  try {
    const users = await userAccountService.getAllUserAccounts();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};