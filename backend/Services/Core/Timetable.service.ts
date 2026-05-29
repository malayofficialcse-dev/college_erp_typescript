import Timetable from "../../Models/Core/Timetable.ts";
import type { DayOfWeek } from "../../Interfaces/Core/index.ts";

export interface ICreateTimetableInput {
  course: string;
  subject: string;
  teacher: string;
  classroom?: string;
  semester?: string;
  section?: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export const createTimetableService = async (data: ICreateTimetableInput) => {
  return Timetable.create(data);
};

export const getAllTimetablesService = async (filter: {
  course?: string;
  subject?: string;
  teacher?: string;
  semester?: string;
  section?: string;
  dayOfWeek?: string;
  isActive?: boolean;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.course) query.course = filter.course;
  if (filter.subject) query.subject = filter.subject;
  if (filter.teacher) query.teacher = filter.teacher;
  if (filter.semester) query.semester = filter.semester;
  if (filter.section) query.section = filter.section;
  if (filter.dayOfWeek) query.dayOfWeek = filter.dayOfWeek;
  if (filter.isActive !== undefined) query.isActive = filter.isActive;

  return Timetable.find(query)
    .populate("course", "name code")
    .populate("subject", "subjectName subjectCode")
    .populate("teacher", "firstName lastName employeeCode")
    .populate("classroom", "roomNumber building")
    .populate("semester", "name semesterNumber")
    .populate("section", "name code")
    .sort({ dayOfWeek: 1, startTime: 1 });
};

export const getTimetableByIdService = async (id: string) => {
  return Timetable.findById(id)
    .populate("course", "name code")
    .populate("subject", "subjectName subjectCode")
    .populate("teacher", "firstName lastName employeeCode")
    .populate("classroom", "roomNumber building")
    .populate("semester", "name semesterNumber")
    .populate("section", "name code");
};

export const updateTimetableService = async (
  id: string,
  data: Partial<ICreateTimetableInput>
) => {
  const timetable = await Timetable.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("course", "name code")
    .populate("subject", "subjectName subjectCode")
    .populate("teacher", "firstName lastName employeeCode");
  if (!timetable) throw new Error("Timetable entry not found");
  return timetable;
};

export const deleteTimetableService = async (id: string) => {
  const timetable = await Timetable.findByIdAndDelete(id);
  if (!timetable) throw new Error("Timetable entry not found");
  return timetable;
};
