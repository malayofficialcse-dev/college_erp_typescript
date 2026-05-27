import Teacher from "../../Models/Core/Teacher.ts";
import type { TeacherStatus } from "../../Interfaces/Core/index.ts";

export interface ICreateTeacherInput {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  qualification?: string;
  joiningDate?: Date;
  department: string;
  status?: TeacherStatus;
}

export const createTeacherService = async (data: ICreateTeacherInput) => {
  const existing = await Teacher.findOne({
    $or: [{ employeeCode: data.employeeCode }, { email: data.email }],
  });
  if (existing) {
    throw new Error("Teacher with same employee code or email already exists");
  }
  return Teacher.create(data);
};

export const getAllTeachersService = async (filter: {
  department?: string;
  status?: string;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.department) query.department = filter.department;
  if (filter.status) query.status = filter.status;
  return Teacher.find(query)
    .populate("department", "name code")
    .sort({ firstName: 1 });
};

export const getTeacherByIdService = async (id: string) => {
  return Teacher.findById(id).populate("department", "name code");
};

export const updateTeacherService = async (
  id: string,
  data: Partial<ICreateTeacherInput>
) => {
  const teacher = await Teacher.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("department", "name code");
  if (!teacher) throw new Error("Teacher not found");
  return teacher;
};

export const deleteTeacherService = async (id: string) => {
  const teacher = await Teacher.findByIdAndDelete(id);
  if (!teacher) throw new Error("Teacher not found");
  return teacher;
};
