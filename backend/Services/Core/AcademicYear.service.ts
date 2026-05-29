import AcademicYear from "../../Models/Core/AcademicYear.ts";

const normalizeDates = (data: Record<string, unknown>) => {
  const payload = { ...data };

  const parseYear = (value: unknown) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const year = Number(value);
      return Number.isNaN(year) ? undefined : year;
    }
    return undefined;
  };

  if (typeof payload.startDate === "string") {
    payload.startDate = new Date(payload.startDate);
  }

  if (typeof payload.endDate === "string") {
    payload.endDate = new Date(payload.endDate);
  }

  const startYear = parseYear(payload.startYear);
  if (startYear !== undefined && payload.startDate === undefined) {
    payload.startDate = new Date(`${startYear}-01-01`);
  }

  const endYear = parseYear(payload.endYear);
  if (endYear !== undefined && payload.endDate === undefined) {
    payload.endDate = new Date(`${endYear}-12-31`);
  }

  if (payload.yearLabel && !payload.name) {
    payload.name = payload.yearLabel;
  }
  if (payload.isCurrent !== undefined && payload.isActive === undefined) {
    payload.isActive = payload.isCurrent;
  }
  return payload;
};

export const createAcademicYearService = async (
  data: Record<string, unknown>
) => {
  const payload = normalizeDates(data);
  const existing = await AcademicYear.findOne({ name: payload.name });
  if (existing) {
    throw new Error("Academic year already exists");
  }
  return AcademicYear.create(payload);
};

export const getAllAcademicYearsService = async () => {
  return AcademicYear.find().sort({ startDate: -1 });
};

export const getAcademicYearByIdService = async (id: string) => {
  const year = await AcademicYear.findById(id);
  if (!year) {
    throw new Error("Academic year not found");
  }
  return year;
};

export const updateAcademicYearService = async (
  id: string,
  data: Record<string, unknown>
) => {
  const year = await AcademicYear.findByIdAndUpdate(id, normalizeDates(data), {
    new: true,
    runValidators: true,
  });
  if (!year) {
    throw new Error("Academic year not found");
  }
  return year;
};

export const deleteAcademicYearService = async (id: string) => {
  return AcademicYear.findByIdAndDelete(id);
};
