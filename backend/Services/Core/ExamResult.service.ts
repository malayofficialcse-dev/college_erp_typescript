import ExamResult from "../../Models/Core/ExamResult.ts";
import type { ExamResultStatus } from "../../Interfaces/Core/index.ts";

export interface ICreateExamResultInput {
  student: string;
  subject: string;
  examSchedule?: string;
  examType?: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  gradePoint?: number;
  resultStatus: ExamResultStatus;
  semesterNumber?: number;
  remarks?: string;
}

export const createExamResultService = async (data: ICreateExamResultInput) => {
  const existing = await ExamResult.findOne({
    student: data.student,
    subject: data.subject,
    ...(data.examSchedule && { examSchedule: data.examSchedule }),
  });
  if (existing) {
    throw new Error("Exam result already exists for this student and subject");
  }
  return ExamResult.create(data);
};

export const getAllExamResultsService = async (filter: {
  student?: string;
  subject?: string;
  examSchedule?: string;
  resultStatus?: string;
  semesterNumber?: number;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.student) query.student = filter.student;
  if (filter.subject) query.subject = filter.subject;
  if (filter.examSchedule) query.examSchedule = filter.examSchedule;
  if (filter.resultStatus) query.resultStatus = filter.resultStatus;
  if (filter.semesterNumber) query.semesterNumber = filter.semesterNumber;

  return ExamResult.find(query)
    .populate("student", "firstName lastName enrollmentNumber")
    .populate("subject", "name code")
    .populate("examSchedule", "examName examType examDate")
    .sort({ createdAt: -1 });
};

export const getExamResultByIdService = async (id: string) => {
  return ExamResult.findById(id)
    .populate("student", "firstName lastName enrollmentNumber")
    .populate("subject", "name code")
    .populate("examSchedule", "examName examType examDate");
};

export const updateExamResultService = async (
  id: string,
  data: Partial<ICreateExamResultInput>
) => {
  const result = await ExamResult.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("student", "firstName lastName enrollmentNumber")
    .populate("subject", "name code");
  if (!result) throw new Error("Exam result not found");
  return result;
};

export const deleteExamResultService = async (id: string) => {
  const result = await ExamResult.findByIdAndDelete(id);
  if (!result) throw new Error("Exam result not found");
  return result;
};
