import Student from "../../Models/Core/Student.ts";
import type { StudentStatus } from "../../Interfaces/Core/index.ts";

export interface ICreateStudentInput {
  enrollmentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: Date;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  department: string;
  course?: string;
  section?: string;
  academicYear?: string;
  currentSemester: number;
  status?: StudentStatus;
}

export const createStudentService = async (data: ICreateStudentInput) => {
  const existing = await Student.findOne({
    $or: [{ enrollmentNumber: data.enrollmentNumber }, { email: data.email }],
  });
  if (existing) {
    throw new Error("Student with same enrollment number or email already exists");
  }
  return Student.create(data);
};

export const getAllStudentsService = async (filter: {
  department?: string;
  course?: string;
  section?: string;
  academicYear?: string;
  status?: string;
  currentSemester?: number;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.department) query.department = filter.department;
  if (filter.course) query.course = filter.course;
  if (filter.section) query.section = filter.section;
  if (filter.academicYear) query.academicYear = filter.academicYear;
  if (filter.status) query.status = filter.status;
  if (filter.currentSemester) query.currentSemester = filter.currentSemester;

  return Student.find(query)
    .populate("department", "name code")
    .populate("course", "name code")
    .populate("section", "name code")
    .populate("academicYear", "name")
    .sort({ enrollmentNumber: 1 });
};

export const getStudentByIdService = async (id: string) => {
  return Student.findById(id)
    .populate("department", "name code")
    .populate("course", "name code")
    .populate("section", "name code")
    .populate("academicYear", "name");
};

export const updateStudentService = async (
  id: string,
  data: Partial<ICreateStudentInput>
) => {
  const student = await Student.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("department", "name code")
    .populate("course", "name code");
  if (!student) throw new Error("Student not found");
  return student;
};

export const deleteStudentService = async (id: string) => {
  const student = await Student.findByIdAndDelete(id);
  if (!student) throw new Error("Student not found");
  return student;
};
