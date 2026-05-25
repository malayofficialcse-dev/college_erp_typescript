import type { Request, Response } from "express";
import {
  createSemesterService,
  deleteSemesterService,
  getAllSemestersService,
  getSemesterByIdService,
  updateSemesterService,
} from "../../Services/Core/Semester.service.ts";

const getId = (req: Request) => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

export const createSemester = async (req: Request, res: Response) => {
  try {
    const semester = await createSemesterService(req.body);
    res.status(201).json({
      success: true,
      message: "Semester created successfully",
      data: semester,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const getAllSemesters = async (_req: Request, res: Response) => {
  try {
    const semesters = await getAllSemestersService();
    res
      .status(200)
      .json({ success: true, count: semesters.length, data: semesters });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const getSemesterById = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Semester id is required" });
    }
    const semester = await getSemesterByIdService(id);
    res.status(200).json({ success: true, data: semester });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const updateSemester = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Semester id is required" });
    }
    const semester = await updateSemesterService(id, req.body);
    res.status(200).json({
      success: true,
      message: "Semester updated successfully",
      data: semester,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const deleteSemester = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Semester id is required" });
    }
    const semester = await deleteSemesterService(id);
    if (!semester) {
      return res
        .status(404)
        .json({ success: false, message: "Semester not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Semester deleted successfully" });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};
