import type { Request, Response } from "express";
import {
  createEventService,
  getAllEventsService,
  getEventByIdService,
  updateEventService,
  deleteEventService,
  createRegistrationService,
  getRegistrationsByEventService,
  getAllRegistrationsService,
  updateRegistrationService,
  deleteRegistrationService,
} from "../../Services/Communication/Event.service.ts";

/* ── Events ─────────────────────────────────────────── */

export const createEvent = async (req: Request, res: Response) => {
  try {
    const event = await createEventService(req.body);
    res.status(201).json({ success: true, message: "Event created successfully", data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const { eventType, status, organizedByDept } = req.query as Record<string, string>;
    const events = await getAllEventsService({ eventType, status, organizedByDept });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await getEventByIdService(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.status(200).json({ success: true, data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const event = await updateEventService(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Event updated successfully", data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    await deleteEventService(req.params.id);
    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── Event Registrations ────────────────────────────── */

export const createRegistration = async (req: Request, res: Response) => {
  try {
    const reg = await createRegistrationService({ ...req.body, event: req.params.eventId });
    res.status(201).json({ success: true, message: "Registration created successfully", data: reg });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRegistrationsByEvent = async (req: Request, res: Response) => {
  try {
    const registrations = await getRegistrationsByEventService(req.params.eventId);
    res.status(200).json({ success: true, count: registrations.length, data: registrations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllRegistrations = async (req: Request, res: Response) => {
  try {
    const registrations = await getAllRegistrationsService();
    res.status(200).json({ success: true, count: registrations.length, data: registrations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRegistration = async (req: Request, res: Response) => {
  try {
    const reg = await updateRegistrationService(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Registration updated successfully", data: reg });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRegistration = async (req: Request, res: Response) => {
  try {
    await deleteRegistrationService(req.params.id);
    res.status(200).json({ success: true, message: "Registration deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
