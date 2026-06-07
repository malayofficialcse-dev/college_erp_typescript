import type { Request, Response } from "express";
import {
  createSubjectService,
  deleteSubjectService,
  getAllSubjectsService,
  getSubjectByIdService,
  updateSubjectService,
} from "../../Services/Core/Subject.service.ts";

const getId = (req: Request) => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const subject = await createSubjectService(req.body);
    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const keyword =
      typeof req.query.keyword === "string" ? req.query.keyword : undefined;
    const courseId =
      typeof req.query.courseId === "string" ? req.query.courseId : undefined;
    const department =
      typeof req.query.department === "string" ? req.query.department : undefined;

    const subjects = await getAllSubjectsService({ keyword, courseId, department });
    res
      .status(200)
      .json({ success: true, count: subjects.length, data: subjects });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const searchSubjects = async (req: Request, res: Response) => {
  try {
    const keyword =
      typeof req.query.keyword === "string" ? req.query.keyword : undefined;
    const courseId =
      typeof req.query.courseId === "string" ? req.query.courseId : undefined;
    const department =
      typeof req.query.department === "string" ? req.query.department : undefined;
    const page = Number(req.query.page ?? 0);
    const size = Number(req.query.size ?? 10);

    const subjects = await getAllSubjectsService({ keyword, courseId, department });
    const start = page * size;
    const content = subjects.slice(start, start + size);

    res.status(200).json({
      content,
      totalPages: Math.ceil(subjects.length / size) || 1,
      totalElements: subjects.length,
      size,
      number: page,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const getSubjectById = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Subject id is required" });
    }
    const subject = await getSubjectByIdService(id);
    res.status(200).json({ success: true, data: subject });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Subject id is required" });
    }
    const subject = await updateSubjectService(id, req.body);
    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: subject,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Subject id is required" });
    }
    const subject = await deleteSubjectService(id);
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Subject deleted successfully" });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};
