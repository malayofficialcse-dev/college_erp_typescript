import Section from "../../Models/Core/Section.ts";

export interface ICreateSectionInput {
  name: string;
  code: string;
  department: string;
  course: string;
  semester: string;
  academicYear?: string;
  capacity: number;
  classTeacher?: string;
  isActive?: boolean;
}

export const createSectionService = async (data: ICreateSectionInput) => {
  const existing = await Section.findOne({
    code: data.code,
    course: data.course,
    semester: data.semester,
  });
  if (existing) {
    throw new Error("Section with same code already exists for this course and semester");
  }
  return Section.create(data);
};

export const getAllSectionsService = async (filter: {
  department?: string;
  course?: string;
  semester?: string;
  academicYear?: string;
  isActive?: boolean;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.department) query.department = filter.department;
  if (filter.course) query.course = filter.course;
  if (filter.semester) query.semester = filter.semester;
  if (filter.academicYear) query.academicYear = filter.academicYear;
  if (filter.isActive !== undefined) query.isActive = filter.isActive;

  return Section.find(query)
    .populate("department", "name code")
    .populate("course", "name code")
    .populate("semester", "name semesterNumber")
    .populate("academicYear", "name")
    .populate("classTeacher", "firstName lastName employeeCode");
};

export const getSectionByIdService = async (id: string) => {
  return Section.findById(id)
    .populate("department", "name code")
    .populate("course", "name code")
    .populate("semester", "name semesterNumber")
    .populate("academicYear", "name")
    .populate("classTeacher", "firstName lastName employeeCode");
};

export const updateSectionService = async (
  id: string,
  data: Partial<ICreateSectionInput>
) => {
  const section = await Section.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("department", "name code")
    .populate("course", "name code");
  if (!section) throw new Error("Section not found");
  return section;
};

export const deleteSectionService = async (id: string) => {
  const section = await Section.findByIdAndDelete(id);
  if (!section) throw new Error("Section not found");
  return section;
};
