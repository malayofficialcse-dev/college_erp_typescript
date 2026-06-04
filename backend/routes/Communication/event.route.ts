import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  createRegistration,
  getRegistrationsByEvent,
  getAllRegistrations,
  updateRegistration,
  deleteRegistration,
} from "../../controllers/Communication/Event.controller.ts";

const router = express.Router();

/* ── Events ─────────────────────────────────────────── */
router.post("/", createEvent);
router.get("/", getAllEvents);
router.get("/registrations", getAllRegistrations);
router.get("/:id", getEventById);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

/* ── Event Registrations (nested) ───────────────────── */
router.post("/:eventId/registrations", createRegistration);
router.get("/:eventId/registrations", getRegistrationsByEvent);
router.put("/registrations/:id", updateRegistration);
router.delete("/registrations/:id", deleteRegistration);

export default router;
