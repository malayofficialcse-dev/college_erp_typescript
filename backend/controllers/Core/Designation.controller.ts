import type { Request, Response } from "express";
import {
  createDesignationService,
  getDesignationByIdService,
  getAllDesignationService,
  updateDesignationService,
  deleteDesignationService,
} from "../../Services/Core/Designation.service.ts";

export const createDesignation = async (req: Request, res: Response) => {
  try {
    const designation = await createDesignationService(req.body);
    res.status(200).json({
      success: true,
      message: "Designation created successfully",
      data: designation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create designation",
    });
  }
};

export const getDesignationById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Designation ID is required",
      });
    }

    const designation = await getDesignationByIdService(id);
    res.status(200).json({
      success: true,
      data: designation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get designation",
    });
  }
};

export const getAllDesignations = async (req: Request, res: Response) => {
  try {
    const department = typeof req.query.department === "string" ? req.query.department : undefined;
    const keyword = typeof req.query.keyword === "string" ? req.query.keyword : undefined;

    const designations = await getAllDesignationService({ department, keyword });
    res.status(200).json({
      success: true,
      count: designations.length,
      data: designations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get designations",
    });
  }
};

export const updateDesignationById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Designation ID is required",
      });
    }

    const designation = await updateDesignationService(id, req.body);
    res.status(200).json({
      success: true,
      message: "Designation updated successfully",
      data: designation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update designation",
    });
  }
};

export const deleteDesignationById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Designation ID is required",
      });
    }

    await deleteDesignationService(id);
    res.status(200).json({
      success: true,
      message: "Designation deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete designation",
    });
  }
};
