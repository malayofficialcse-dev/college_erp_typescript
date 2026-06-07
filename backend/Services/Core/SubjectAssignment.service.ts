import SubjectAssignment from "../../Models/Core/SubjectAssignment.ts";
import Course from "../../Models/Core/Courses.ts";

export interface ICreateSubjectAssignmentInput {
  teacher: string;
  subject: string;
  course: string;
  semester: string;
  section?: string;
  academicYear?: string;
  isActive?: boolean;
}

export const createSubjectAssignmentService = async (
  data: ICreateSubjectAssignmentInput
) => {
  const existing = await SubjectAssignment.findOne({
    teacher: data.teacher,
    subject: data.subject,
    course: data.course,
    semester: data.semester,
    ...(data.section && { section: data.section }),
    ...(data.academicYear && { academicYear: data.academicYear }),
  });
  if (existing) {
    throw new Error(
      "Subject assignment already exists for this teacher, subject, and course combination"
    );
  }
  return SubjectAssignment.create(data);
};

export const getAllSubjectAssignmentsService = async (filter: {
  teacher?: string;
  subject?: string;
  course?: string;
  semester?: string;
  section?: string;
  academicYear?: string;
  isActive?: boolean;
  department?: string;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.teacher) query.teacher = filter.teacher;
  if (filter.subject) query.subject = filter.subject;
  if (filter.course) query.course = filter.course;
  if (filter.semester) query.semester = filter.semester;
  if (filter.section) query.section = filter.section;
  if (filter.academicYear) query.academicYear = filter.academicYear;
  if (filter.isActive !== undefined) query.isActive = filter.isActive;
  if (filter.department && !filter.course) {
    const courses = await Course.find({ department: filter.department }).select("_id");
    query.course = { $in: courses.map((course) => course._id) };
  }

  return SubjectAssignment.find(query)
    .populate("teacher", "firstName lastName employeeCode")
    .populate("subject", "name code")
    .populate("course", "name code")
    .populate("semester", "name semesterNumber")
    .populate("section", "name code")
    .populate("academicYear", "name");
};

export const getSubjectAssignmentByIdService = async (id: string) => {
  return SubjectAssignment.findById(id)
    .populate("teacher", "firstName lastName employeeCode")
    .populate("subject", "name code")
    .populate("course", "name code")
    .populate("semester", "name semesterNumber")
    .populate("section", "name code")
    .populate("academicYear", "name");
};

export const updateSubjectAssignmentService = async (
  id: string,
  data: Partial<ICreateSubjectAssignmentInput>
) => {
  const assignment = await SubjectAssignment.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("teacher", "firstName lastName employeeCode")
    .populate("subject", "name code");
  if (!assignment) throw new Error("Subject assignment not found");
  return assignment;
};

export const deleteSubjectAssignmentService = async (id: string) => {
  const assignment = await SubjectAssignment.findByIdAndDelete(id);
  if (!assignment) throw new Error("Subject assignment not found");
  return assignment;
};
