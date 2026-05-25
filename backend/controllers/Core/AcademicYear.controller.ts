import type { Request, Response } from "express";
import {
  createAcademicYearService,
  deleteAcademicYearService,
  getAcademicYearByIdService,
  getAllAcademicYearsService,
  updateAcademicYearService,
} from "../../Services/Core/AcademicYear.service.ts";

const getId = (req: Request) => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

export const createAcademicYear = async (req: Request, res: Response) => {
  try {
    const year = await createAcademicYearService(req.body);
    res.status(201).json({
      success: true,
      message: "Academic year created successfully",
      data: year,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const getAllAcademicYears = async (_req: Request, res: Response) => {
  try {
    const years = await getAllAcademicYearsService();
    res.status(200).json({ success: true, count: years.length, data: years });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const getAcademicYearById = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Academic year id is required" });
    }
    const year = await getAcademicYearByIdService(id);
    res.status(200).json({ success: true, data: year });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const updateAcademicYear = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Academic year id is required" });
    }
    const year = await updateAcademicYearService(id, req.body);
    res.status(200).json({
      success: true,
      message: "Academic year updated successfully",
      data: year,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const deleteAcademicYear = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Academic year id is required" });
    }
    const year = await deleteAcademicYearService(id);
    if (!year) {
      return res
        .status(404)
        .json({ success: false, message: "Academic year not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Academic year deleted successfully" });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};
