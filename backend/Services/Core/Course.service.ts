import Course from "../../Models/Core/Courses.ts";

export const createCourseService = async (data: Record<string, unknown>) => {
  const courseCode = await Course.findOne({ code: data.code });

  if (courseCode) {
    throw new Error("Course already exists");
  }

  return Course.create(data);
};

export const getAllCoursesService = async () => {
  return Course.find().populate("department", "name code");
};

export const getCourseByIdService = async (id: string) => {
  const course = await Course.findById(id).populate("department", "name code");
  if (!course) {
    throw new Error("Course not found");
  }
  return course;
};

export const updateCourseService = async (
  id: string,
  data: Record<string, unknown>
) => {
  const course = await Course.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("department", "name code");

  if (!course) {
    throw new Error("Course not found");
  }
  return course;
};

export const deleteCourseByIdService = async (id: string) => {
  return Course.findByIdAndDelete(id);
};
