import Subject from "../../Models/Core/Subject.ts";

const normalizePayload = (data: Record<string, unknown>) => {
  const payload = { ...data };

  if (payload.name && !payload.subjectName) {
    payload.subjectName = payload.name;
  }
  if (payload.courseId && !payload.course) {
    payload.course = payload.courseId;
  }
  if (payload.departmentId && !payload.department) {
    payload.department = payload.departmentId;
  }
  if (payload.semesterId && !payload.semester) {
    payload.semester = payload.semesterId;
  }
  if (typeof payload.subjectType === "string") {
    const type = payload.subjectType.toLowerCase();
    if (type === "theory") payload.subjectType = "Theory";
    if (type === "practical") payload.subjectType = "Practical";
    if (type === "lab") payload.subjectType = "Lab";
  }

  return payload;
};

export const createSubjectService = async (data: Record<string, unknown>) => {
  const payload = normalizePayload(data);
  const existing = await Subject.findOne({ subjectCode: payload.subjectCode });
  if (existing) {
    throw new Error("Subject code already exists");
  }
  return Subject.create(payload);
};

export const getAllSubjectsService = async (filters?: {
  keyword?: string;
  courseId?: string;
  department?: string;
}) => {
  const query: Record<string, unknown> = {};

  if (filters?.courseId) {
    query.course = filters.courseId;
  }
  if (filters?.department) {
    query.department = filters.department;
  }
  if (filters?.keyword) {
    const keyword = filters.keyword;
    query.$or = [
      { subjectName: { $regex: keyword, $options: "i" } },
      { subjectCode: { $regex: keyword, $options: "i" } },
    ];
  }

  return Subject.find(query)
    .populate("department", "name code")
    .populate("course", "name code")
    .populate("semester", "name semesterNumber");
};

export const getSubjectByIdService = async (id: string) => {
  const subject = await Subject.findById(id)
    .populate("department", "name code")
    .populate("course", "name code")
    .populate("semester", "name semesterNumber");

  if (!subject) {
    throw new Error("Subject not found");
  }
  return subject;
};

export const updateSubjectService = async (
  id: string,
  data: Record<string, unknown>
) => {
  const subject = await Subject.findByIdAndUpdate(id, normalizePayload(data), {
    new: true,
    runValidators: true,
  })
    .populate("department", "name code")
    .populate("course", "name code")
    .populate("semester", "name semesterNumber");

  if (!subject) {
    throw new Error("Subject not found");
  }
  return subject;
};

export const deleteSubjectService = async (id: string) => {
  return Subject.findByIdAndDelete(id);
};
