import ExamSchedule from "../../Models/Core/ExamSchedule.ts";
import type { ExamType, ExamScheduleStatus } from "../../Interfaces/Core/index.ts";

export interface ICreateExamScheduleInput {
  examName: string;
  course: string;
  subject?: string;
  semester?: string;
  semesterNumber?: number;
  examType: ExamType;
  examDate: Date;
  startTime: string;
  endTime: string;
  classroom?: string;
  status?: ExamScheduleStatus;
}

export const createExamScheduleService = async (
  data: ICreateExamScheduleInput
) => {
  return ExamSchedule.create(data);
};

export const getAllExamSchedulesService = async (filter: {
  course?: string;
  subject?: string;
  semester?: string;
  examType?: string;
  status?: string;
  semesterNumber?: number;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.course) query.course = filter.course;
  if (filter.subject) query.subject = filter.subject;
  if (filter.semester) query.semester = filter.semester;
  if (filter.examType) query.examType = filter.examType;
  if (filter.status) query.status = filter.status;
  if (filter.semesterNumber) query.semesterNumber = filter.semesterNumber;

  return ExamSchedule.find(query)
    .populate("course", "name code")
    .populate("subject", "subjectName subjectCode")
    .populate("semester", "name semesterNumber")
    .populate("classroom", "roomNumber building")
    .sort({ examDate: 1 });
};

export const getExamScheduleByIdService = async (id: string) => {
  return ExamSchedule.findById(id)
    .populate("course", "name code")
    .populate("subject", "subjectName subjectCode")
    .populate("semester", "name semesterNumber")
    .populate("classroom", "roomNumber building");
};

export const updateExamScheduleService = async (
  id: string,
  data: Partial<ICreateExamScheduleInput>
) => {
  const schedule = await ExamSchedule.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("course", "name code")
    .populate("subject", "subjectName subjectCode");
  if (!schedule) throw new Error("Exam schedule not found");
  return schedule;
};

export const deleteExamScheduleService = async (id: string) => {
  const schedule = await ExamSchedule.findByIdAndDelete(id);
  if (!schedule) throw new Error("Exam schedule not found");
  return schedule;
};
