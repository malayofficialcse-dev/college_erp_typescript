import Semester from "../../Models/Core/Semester.ts";
import AcademicYear from "../../Models/Core/AcademicYear.ts";

const normalizePayload = (data: Record<string, unknown>) => {
  const payload = { ...data };

  if (payload.semesterName && !payload.name) {
    payload.name = payload.semesterName;
  }
  if (payload.academicYearId && !payload.academicYear) {
    payload.academicYear = payload.academicYearId;
  }
  if (payload.isCurrent !== undefined && payload.isActive === undefined) {
    payload.isActive = payload.isCurrent;
  }
  if (typeof payload.startDate === "string") {
    payload.startDate = new Date(payload.startDate);
  }
  if (typeof payload.endDate === "string") {
    payload.endDate = new Date(payload.endDate);
  }

  return payload;
};

export const createSemesterService = async (data: Record<string, unknown>) => {
  const payload = normalizePayload(data);
  const academicYearId = payload.academicYear as string | undefined;

  if (!academicYearId) {
    throw new Error("Academic year is required");
  }

  const academicYear = await AcademicYear.findById(academicYearId);
  if (!academicYear) {
    throw new Error("Academic year not found");
  }

  return Semester.create(payload);
};

export const getAllSemestersService = async () => {
  return Semester.find()
    .populate("academicYear", "name startDate endDate isActive")
    .sort({ semesterNumber: 1 });
};

export const getSemesterByIdService = async (id: string) => {
  const semester = await Semester.findById(id).populate(
    "academicYear",
    "name startDate endDate isActive"
  );
  if (!semester) {
    throw new Error("Semester not found");
  }
  return semester;
};

export const updateSemesterService = async (
  id: string,
  data: Record<string, unknown>
) => {
  const payload = normalizePayload(data);
  if (payload.academicYear) {
    const academicYear = await AcademicYear.findById(payload.academicYear);
    if (!academicYear) {
      throw new Error("Academic year not found");
    }
  }

  const semester = await Semester.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate("academicYear", "name startDate endDate isActive");

  if (!semester) {
    throw new Error("Semester not found");
  }
  return semester;
};

export const deleteSemesterService = async (id: string) => {
  return Semester.findByIdAndDelete(id);
};
