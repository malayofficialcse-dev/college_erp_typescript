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
  gender?: string;
  currentSemester?: string;
  keyword?: string;
  page?: number;
  size?: number;
}) => {
  const query: Record<string, unknown> = {};

  // Multi-value comma-separated support
  if (filter.department) {
    const ids = filter.department.split(',').map(s => s.trim()).filter(Boolean);
    query.department = ids.length === 1 ? ids[0] : { $in: ids };
  }
  if (filter.course) query.course = filter.course;
  if (filter.section) query.section = filter.section;
  if (filter.academicYear) query.academicYear = filter.academicYear;

  if (filter.status) {
    const vals = filter.status.split(',').map(s => s.trim()).filter(Boolean);
    query.status = vals.length === 1 ? vals[0] : { $in: vals };
  }
  if (filter.gender) {
    const vals = filter.gender.split(',').map(s => s.trim()).filter(Boolean);
    query.gender = vals.length === 1 ? vals[0] : { $in: vals };
  }
  if (filter.currentSemester) {
    const semStr = String(filter.currentSemester);
    const sems = semStr.split(',').map(Number).filter(Boolean);
    query.currentSemester = sems.length === 1 ? sems[0] : { $in: sems };
  }
  if (filter.keyword) {
    const rx = { $regex: filter.keyword, $options: 'i' };
    query.$or = [
      { firstName: rx }, { lastName: rx },
      { email: rx },     { enrollmentNumber: rx },
      { phone: rx },
    ];
  }

  const page = Math.max((filter.page ?? 0), 0);
  const size = Math.min(filter.size ?? 15, 1000);
  const skip = page * size;

  const [students, total] = await Promise.all([
    Student.find(query)
      .populate("department", "name code")
      .populate("course", "name code")
      .populate("section", "name code")
      .populate("academicYear", "name")
      .sort({ enrollmentNumber: 1 })
      .skip(skip)
      .limit(size),
    Student.countDocuments(query),
  ]);

  return {
    content: students,
    total,
    page,
    size,
    totalPages: Math.ceil(total / size),
  };
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
