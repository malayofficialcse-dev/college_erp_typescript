import type { Request, Response } from "express";
import {
  createSubjectAssignmentService,
  getAllSubjectAssignmentsService,
  getSubjectAssignmentByIdService,
  updateSubjectAssignmentService,
  deleteSubjectAssignmentService,
} from "../../Services/Core/SubjectAssignment.service.ts";

export const createSubjectAssignment = async (req: Request, res: Response) => {
  try {
    const assignment = await createSubjectAssignmentService(req.body);
    res.status(201).json({ success: true, message: "Subject assignment created successfully", data: assignment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllSubjectAssignments = async (req: Request, res: Response) => {
  try {
    const { teacher, subject, course, semester, section, academicYear, department } = req.query as Record<string, string>;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;
    const assignments = await getAllSubjectAssignmentsService({ teacher, subject, course, semester, section, academicYear, department, isActive });
    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubjectAssignmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Subject assignment id is required" });
    const assignment = await getSubjectAssignmentByIdService(id);
    if (!assignment) return res.status(404).json({ success: false, message: "Subject assignment not found" });
    res.status(200).json({ success: true, data: assignment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSubjectAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Subject assignment id is required" });
    const assignment = await updateSubjectAssignmentService(id, req.body);
    res.status(200).json({ success: true, message: "Subject assignment updated successfully", data: assignment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSubjectAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Subject assignment id is required" });
    await deleteSubjectAssignmentService(id);
    res.status(200).json({ success: true, message: "Subject assignment deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
