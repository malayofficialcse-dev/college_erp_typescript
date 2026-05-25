import type { Request, Response } from "express";
import {
  createClassroomService,
  deleteClassroomService,
  getAllClassroomsService,
  getClassroomByIdService,
  updateClassroomService,
} from "../../Services/Core/Classroom.service.ts";

const getId = (req: Request) => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

export const createClassroom = async (req: Request, res: Response) => {
  try {
    const classroom = await createClassroomService(req.body);
    res.status(201).json({
      success: true,
      message: "Classroom created successfully",
      data: classroom,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const getAllClassrooms = async (_req: Request, res: Response) => {
  try {
    const classrooms = await getAllClassroomsService();
    res
      .status(200)
      .json({ success: true, count: classrooms.length, data: classrooms });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const getClassroomById = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Classroom id is required" });
    }
    const classroom = await getClassroomByIdService(id);
    res.status(200).json({ success: true, data: classroom });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const updateClassroom = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Classroom id is required" });
    }
    const classroom = await updateClassroomService(id, req.body);
    res.status(200).json({
      success: true,
      message: "Classroom updated successfully",
      data: classroom,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const deleteClassroom = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Classroom id is required" });
    }
    const classroom = await deleteClassroomService(id);
    if (!classroom) {
      return res
        .status(404)
        .json({ success: false, message: "Classroom not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Classroom deleted successfully" });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};
