import type { Request, Response } from "express";
import {
  createCounselingService,
  getAllCounselingsService,
  getCounselingByIdService,
  updateCounselingStatusService,
  updateCounselingService,
  deleteCounselingService,
} from "../../Services/Core/Counseling.service.ts";
import type { CounselingStatus } from "../../Interfaces/Core/index.ts";

export const createCounseling = async (req: Request, res: Response) => {
  try {
    const counseling = await createCounselingService(req.body);
    res.status(201).json({ success: true, message: "Counseling record created successfully", data: counseling });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCounselings = async (req: Request, res: Response) => {
  try {
    const { status, desiredCourse } = req.query as Record<string, string>;
    const counselings = await getAllCounselingsService({ status, desiredCourse });
    res.status(200).json({ success: true, count: counselings.length, data: counselings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCounselingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Counseling id is required" });
    const counseling = await getCounselingByIdService(id);
    if (!counseling) return res.status(404).json({ success: false, message: "Counseling record not found" });
    res.status(200).json({ success: true, data: counseling });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCounselingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Counseling id is required" });
    const { status, counselorName, remarks } = req.body as { status: CounselingStatus; counselorName?: string; remarks?: string };
    if (!status) return res.status(400).json({ success: false, message: "Status is required" });
    const counseling = await updateCounselingStatusService(id, status, counselorName, remarks);
    res.status(200).json({ success: true, message: "Counseling status updated successfully", data: counseling });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCounseling = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Counseling id is required" });
    const counseling = await updateCounselingService(id, req.body);
    res.status(200).json({ success: true, message: "Counseling record updated successfully", data: counseling });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCounseling = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Counseling id is required" });
    await deleteCounselingService(id);
    res.status(200).json({ success: true, message: "Counseling record deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
