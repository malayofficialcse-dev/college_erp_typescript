import type { Request, Response } from "express";
import Scholarship from "../../Models/Finance/Scholarship.ts";

export const getScholarships = async (_req: Request, res: Response) => {
  try {
    const scholarships = await Scholarship.find()
      .populate("student", "firstName lastName enrollmentNumber email")
      .populate("academicYear", "name code")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: scholarships });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createScholarship = async (req: Request, res: Response) => {
  try {
    const scholarship = await Scholarship.create(req.body);
    res.status(201).json({ success: true, message: "Scholarship created", data: scholarship });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateScholarship = async (req: Request, res: Response) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!scholarship) {
      return res.status(404).json({ success: false, message: "Scholarship not found" });
    }
    res.status(200).json({ success: true, data: scholarship });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteScholarship = async (req: Request, res: Response) => {
  try {
    const scholarship = await Scholarship.findByIdAndDelete(req.params.id);
    if (!scholarship) {
      return res.status(404).json({ success: false, message: "Scholarship not found" });
    }
    res.status(200).json({ success: true, message: "Scholarship deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
