import type { Request, Response } from "express";
import {
  createStudentService,
  getAllStudentsService,
  getStudentByIdService,
  updateStudentService,
  deleteStudentService,
} from "../../Services/Core/Student.service.ts";

export const createStudent = async (req: Request, res: Response) => {
  try {
    const student = await createStudentService(req.body);
    res.status(201).json({ success: true, message: "Student created successfully", data: student });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const { department, course, section, academicYear, status } = req.query as Record<string, string>;
    const currentSemester = req.query.currentSemester ? Number(req.query.currentSemester) : undefined;
    const students = await getAllStudentsService({ department, course, section, academicYear, status, currentSemester });
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Student id is required" });
    const student = await getStudentByIdService(id);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.status(200).json({ success: true, data: student });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Student id is required" });
    const student = await updateStudentService(id, req.body);
    res.status(200).json({ success: true, message: "Student updated successfully", data: student });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Student id is required" });
    await deleteStudentService(id);
    res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
