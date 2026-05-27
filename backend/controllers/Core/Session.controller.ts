import type { Request, Response } from "express";
import {
  createSessionService,
  getAllSessionsService,
  getSessionByIdService,
  updateSessionService,
  deleteSessionService,
} from "../../Services/Core/Session.service.ts";

export const createSession = async (req: Request, res: Response) => {
  try {
    const session = await createSessionService(req.body);
    res.status(201).json({ success: true, message: "Session created successfully", data: session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const { academicYear } = req.query as Record<string, string>;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;
    const sessions = await getAllSessionsService({ academicYear, isActive });
    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Session id is required" });
    const session = await getSessionByIdService(id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    res.status(200).json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Session id is required" });
    const session = await updateSessionService(id, req.body);
    res.status(200).json({ success: true, message: "Session updated successfully", data: session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Session id is required" });
    await deleteSessionService(id);
    res.status(200).json({ success: true, message: "Session deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
