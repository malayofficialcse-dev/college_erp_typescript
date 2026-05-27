import Session from "../../Models/Core/Session.ts";

export interface ICreateSessionInput {
  label: string;
  academicYear: string;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
}

export const createSessionService = async (data: ICreateSessionInput) => {
  const existing = await Session.findOne({
    label: data.label,
    academicYear: data.academicYear,
  });
  if (existing) {
    throw new Error("Session with this label already exists for the academic year");
  }
  return Session.create(data);
};

export const getAllSessionsService = async (filter: {
  academicYear?: string;
  isActive?: boolean;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.academicYear) query.academicYear = filter.academicYear;
  if (filter.isActive !== undefined) query.isActive = filter.isActive;
  return Session.find(query)
    .populate("academicYear", "name")
    .sort({ startDate: 1 });
};

export const getSessionByIdService = async (id: string) => {
  return Session.findById(id).populate("academicYear", "name");
};

export const updateSessionService = async (
  id: string,
  data: Partial<ICreateSessionInput>
) => {
  const session = await Session.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("academicYear", "name");
  if (!session) throw new Error("Session not found");
  return session;
};

export const deleteSessionService = async (id: string) => {
  const session = await Session.findByIdAndDelete(id);
  if (!session) throw new Error("Session not found");
  return session;
};
