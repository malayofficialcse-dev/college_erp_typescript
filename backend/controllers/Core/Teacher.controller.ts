import type { Request, Response } from "express";
import {
  createTeacherService,
  getAllTeachersService,
  getTeacherByIdService,
  updateTeacherService,
  deleteTeacherService,
} from "../../Services/Core/Teacher.service.ts";

export const createTeacher = async (req: Request, res: Response) => {
  try {
    const teacher = await createTeacherService(req.body);
    res.status(201).json({ success: true, message: "Teacher created successfully", data: teacher });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const { department, status, keyword, page, size } = req.query as Record<string, string>;
    const result = await getAllTeachersService({
      department,
      status,
      keyword,
      page: page ? parseInt(page, 10) : undefined,
      size: size ? parseInt(size, 10) : undefined,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Teacher id is required" });
    const teacher = await getTeacherByIdService(id);
    if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });
    res.status(200).json({ success: true, data: teacher });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Teacher id is required" });
    const teacher = await updateTeacherService(id, req.body);
    res.status(200).json({ success: true, message: "Teacher updated successfully", data: teacher });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Teacher id is required" });
    await deleteTeacherService(id);
    res.status(200).json({ success: true, message: "Teacher deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
