import Event from "../../Models/Communication/Event.ts";
import EventRegistration from "../../Models/Communication/EventRegistration.ts";

export interface ICreateEventInput {
  title: string;
  description?: string;
  eventType?: "CULTURAL" | "SPORTS" | "ACADEMIC" | "SEMINAR" | "WORKSHOP";
  eventDate: Date;
  startTime?: string;
  endTime?: string;
  venue?: string;
  organizedByDept?: string;
  organizerName?: string;
  status?: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
}

export interface ICreateRegistrationInput {
  event: string;
  attendeeName: string;
  attendeeRole: "STUDENT" | "EMPLOYEE" | "GUEST";
  student?: string;
  employee?: string;
  registrationDate?: Date;
  status?: "CONFIRMED" | "PENDING" | "CANCELLED";
}

/* ── Events ─────────────────────────────────────────── */

export const createEventService = async (data: ICreateEventInput) => {
  return Event.create(data);
};

export const getAllEventsService = async (filter: {
  eventType?: string;
  status?: string;
  organizedByDept?: string;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.eventType) query.eventType = filter.eventType;
  if (filter.status) query.status = filter.status;
  if (filter.organizedByDept) query.organizedByDept = filter.organizedByDept;

  return Event.find(query)
    .populate("organizedByDept", "name code")
    .sort({ eventDate: -1, createdAt: -1 });
};

export const getEventByIdService = async (id: string) => {
  return Event.findById(id).populate("organizedByDept", "name code");
};

export const updateEventService = async (
  id: string,
  data: Partial<ICreateEventInput>
) => {
  const event = await Event.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("organizedByDept", "name code");
  if (!event) throw new Error("Event not found");
  return event;
};

export const deleteEventService = async (id: string) => {
  const event = await Event.findByIdAndDelete(id);
  if (!event) throw new Error("Event not found");
  return event;
};

/* ── Event Registrations ────────────────────────────── */

export const createRegistrationService = async (
  data: ICreateRegistrationInput
) => {
  return EventRegistration.create(data);
};

export const getRegistrationsByEventService = async (eventId: string) => {
  return EventRegistration.find({ event: eventId })
    .populate("student", "firstName lastName studentCode")
    .populate("employee", "firstName lastName employeeCode")
    .sort({ registrationDate: -1 });
};

export const getAllRegistrationsService = async () => {
  return EventRegistration.find()
    .populate("event", "title eventDate venue")
    .populate("student", "firstName lastName")
    .populate("employee", "firstName lastName")
    .sort({ createdAt: -1 });
};

export const updateRegistrationService = async (
  id: string,
  data: Partial<ICreateRegistrationInput>
) => {
  const reg = await EventRegistration.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!reg) throw new Error("Registration not found");
  return reg;
};

export const deleteRegistrationService = async (id: string) => {
  const reg = await EventRegistration.findByIdAndDelete(id);
  if (!reg) throw new Error("Registration not found");
  return reg;
};
