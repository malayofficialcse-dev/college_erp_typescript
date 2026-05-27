import type { Request, Response } from "express";
import {
  createLeaveService,
  getAllLeavesService,
  getLeaveByIdService,
  updateLeaveStatusService,
  deleteLeaveService,
} from "../../Services/HR/Leave.service.ts";
import type { LeaveStatus } from "../../Interfaces/HR/index.ts";

export const createLeave = async (req: Request, res: Response) => {
  try {
    const leave = await createLeaveService(req.body);
    res.status(201).json({
      success: true,
      message: "Leave request created successfully",
      data: leave,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllLeaves = async (req: Request, res: Response) => {
  try {
    const { employee, status, leaveType } = req.query as Record<string, string>;
    const leaves = await getAllLeavesService({ employee, status, leaveType });
    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeaveById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Leave id is required" });
    }
    const leave = await getLeaveByIdService(id);
    if (!leave) {
      return res
        .status(404)
        .json({ success: false, message: "Leave not found" });
    }
    res.status(200).json({ success: true, data: leave });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLeaveStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Leave id is required" });
    }
    const { status, approvedBy, remarks } = req.body as {
      status: LeaveStatus;
      approvedBy?: string;
      remarks?: string;
    };
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }
    const leave = await updateLeaveStatusService(
      id,
      status,
      approvedBy,
      remarks
    );
    res.status(200).json({
      success: true,
      message: "Leave status updated successfully",
      data: leave,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Leave id is required" });
    }
    await deleteLeaveService(id);
    res
      .status(200)
      .json({ success: true, message: "Leave deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
