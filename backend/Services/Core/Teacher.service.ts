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
  keyword?: string;
  page?: number;
  size?: number;
}) => {
  const query: Record<string, unknown> = {};

  if (filter.department) {
    const ids = filter.department.split(",").map((s) => s.trim()).filter(Boolean);
    query.department = ids.length === 1 ? ids[0] : { $in: ids };
  }
  if (filter.status) {
    const statuses = filter.status.split(",").map((s) => s.trim()).filter(Boolean);
    query.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
  }
  if (filter.keyword) {
    const rx = { $regex: filter.keyword, $options: "i" };
    query.$or = [
      { firstName: rx },
      { lastName: rx },
      { email: rx },
      { employeeCode: rx },
      { phone: rx },
      { designation: rx },
    ];
  }

  const page = Math.max(filter.page ?? 0, 0);
  const size = Math.min(filter.size ?? 15, 1000);
  const skip = page * size;

  const [teachers, total] = await Promise.all([
    Teacher.find(query)
      .populate("department", "name code")
      .sort({ firstName: 1 })
      .skip(skip)
      .limit(size),
    Teacher.countDocuments(query),
  ]);

  return {
    content: teachers,
    total,
    page,
    size,
    totalPages: Math.ceil(total / size),
  };
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
