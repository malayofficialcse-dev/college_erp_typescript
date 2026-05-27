import type { Request, Response } from "express";
import {
  createSectionService,
  getAllSectionsService,
  getSectionByIdService,
  updateSectionService,
  deleteSectionService,
} from "../../Services/Core/Section.service.ts";

export const createSection = async (req: Request, res: Response) => {
  try {
    const section = await createSectionService(req.body);
    res.status(201).json({ success: true, message: "Section created successfully", data: section });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllSections = async (req: Request, res: Response) => {
  try {
    const { department, course, semester, academicYear } = req.query as Record<string, string>;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;
    const sections = await getAllSectionsService({ department, course, semester, academicYear, isActive });
    res.status(200).json({ success: true, count: sections.length, data: sections });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Section id is required" });
    const section = await getSectionByIdService(id);
    if (!section) return res.status(404).json({ success: false, message: "Section not found" });
    res.status(200).json({ success: true, data: section });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Section id is required" });
    const section = await updateSectionService(id, req.body);
    res.status(200).json({ success: true, message: "Section updated successfully", data: section });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Section id is required" });
    await deleteSectionService(id);
    res.status(200).json({ success: true, message: "Section deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
