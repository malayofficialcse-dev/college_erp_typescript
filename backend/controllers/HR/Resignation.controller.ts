import type { Request, Response } from "express";
import {
  createResignationService,
  getAllResignationsService,
  getResignationByIdService,
  updateResignationStatusService,
  deleteResignationService,
} from "../../Services/HR/Resignation.service.ts";
import type { ResignationStatus } from "../../Interfaces/HR/index.ts";

export const createResignation = async (req: Request, res: Response) => {
  try {
    const resignation = await createResignationService(req.body);
    res.status(201).json({
      success: true,
      message: "Resignation request submitted successfully",
      data: resignation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllResignations = async (req: Request, res: Response) => {
  try {
    const { employee, status } = req.query as Record<string, string>;
    const resignations = await getAllResignationsService({ employee, status });
    res.status(200).json({
      success: true,
      count: resignations.length,
      data: resignations,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getResignationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Resignation id is required" });
    }
    const resignation = await getResignationByIdService(id);
    if (!resignation) {
      return res
        .status(404)
        .json({ success: false, message: "Resignation not found" });
    }
    res.status(200).json({ success: true, data: resignation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateResignationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Resignation id is required" });
    }
    const { status, reviewedBy, reviewRemarks } = req.body as {
      status: ResignationStatus;
      reviewedBy?: string;
      reviewRemarks?: string;
    };
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }
    const resignation = await updateResignationStatusService(
      id,
      status,
      reviewedBy,
      reviewRemarks
    );
    res.status(200).json({
      success: true,
      message: "Resignation status updated successfully",
      data: resignation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteResignation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Resignation id is required" });
    }
    await deleteResignationService(id);
    res
      .status(200)
      .json({ success: true, message: "Resignation deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
