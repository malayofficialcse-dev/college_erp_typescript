import type { Request, Response } from "express";
import {
  createAdmissionService,
  getAllAdmissionsService,
  getAdmissionByIdService,
  updateAdmissionService,
  deleteAdmissionService,
} from "../../Services/Core/Admission.service.ts";

export const createAdmission = async (req: Request, res: Response) => {
  try {
    const admission = await createAdmissionService(req.body);
    res.status(201).json({ success: true, message: "Admission created successfully", data: admission });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAdmissions = async (req: Request, res: Response) => {
  try {
    const { department, course, academicYear, status, paymentPlan } = req.query as Record<string, string>;
    const admissions = await getAllAdmissionsService({ department, course, academicYear, status, paymentPlan });
    res.status(200).json({ success: true, count: admissions.length, data: admissions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdmissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Admission id is required" });
    const admission = await getAdmissionByIdService(id);
    if (!admission) return res.status(404).json({ success: false, message: "Admission not found" });
    res.status(200).json({ success: true, data: admission });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Admission id is required" });
    const admission = await updateAdmissionService(id, req.body);
    res.status(200).json({ success: true, message: "Admission updated successfully", data: admission });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdmission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Admission id is required" });
    await deleteAdmissionService(id);
    res.status(200).json({ success: true, message: "Admission deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
