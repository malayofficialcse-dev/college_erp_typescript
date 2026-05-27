import type { Request, Response } from "express";
import {
  createLeaveApprovalStepService,
  getApprovalStepsByLeaveService,
  getLeaveApprovalStepByIdService,
  updateLeaveApprovalStepStatusService,
  deleteLeaveApprovalStepService,
} from "../../Services/HR/LeaveApprovalStep.service.ts";
import type { ApprovalStepStatus } from "../../Interfaces/HR/index.ts";

export const createLeaveApprovalStep = async (req: Request, res: Response) => {
  try {
    const step = await createLeaveApprovalStepService(req.body);
    res.status(201).json({
      success: true,
      message: "Leave approval step created successfully",
      data: step,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getApprovalStepsByLeave = async (req: Request, res: Response) => {
  try {
    const { leaveId } = req.params;
    if (!leaveId) {
      return res
        .status(400)
        .json({ success: false, message: "Leave id is required" });
    }
    const steps = await getApprovalStepsByLeaveService(leaveId);
    res.status(200).json({
      success: true,
      count: steps.length,
      data: steps,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLeaveApprovalStepById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Step id is required" });
    }
    const step = await getLeaveApprovalStepByIdService(id);
    if (!step) {
      return res
        .status(404)
        .json({ success: false, message: "Leave approval step not found" });
    }
    res.status(200).json({ success: true, data: step });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLeaveApprovalStepStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Step id is required" });
    }
    const { status, remarks } = req.body as {
      status: ApprovalStepStatus;
      remarks?: string;
    };
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }
    const step = await updateLeaveApprovalStepStatusService(
      id,
      status,
      remarks
    );
    res.status(200).json({
      success: true,
      message: "Leave approval step updated successfully",
      data: step,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLeaveApprovalStep = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Step id is required" });
    }
    await deleteLeaveApprovalStepService(id);
    res.status(200).json({
      success: true,
      message: "Leave approval step deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
