import type { Request, Response } from "express";
import {
  createCourseService,
  deleteCourseByIdService,
  getAllCoursesService,
  getCourseByIdService,
  updateCourseService,
} from "../../Services/Core/Course.service.ts";

const getId = (req: Request) => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const course = await createCourseService(req.body);
    res.status(201).json({
      success: true,
      data: course,
      message: "Course created successfully",
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const department =
      typeof req.query.department === "string"
        ? req.query.department
        : typeof req.query.departmentId === "string"
          ? req.query.departmentId
          : undefined;
    const courses = await getAllCoursesService({ department });
    res.status(200).json({
      message: `${courses.length} courses found`,
      success: true,
      data: courses,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const searchCourses = async (req: Request, res: Response) => {
  try {
    const keyword =
      typeof req.query.keyword === "string"
        ? req.query.keyword.toLowerCase()
        : "";
    const departmentId =
      typeof req.query.departmentId === "string"
        ? req.query.departmentId
        : undefined;
    const page = Number(req.query.page ?? 0);
    const size = Number(req.query.size ?? 10);

    let courses = await getAllCoursesService({ department: departmentId });

    if (keyword) {
      courses = courses.filter(
        (course) =>
          course.name.toLowerCase().includes(keyword) ||
          course.code.toLowerCase().includes(keyword)
      );
    }
    if (departmentId) {
      courses = courses.filter((course) => {
        const dept = course.department as { _id?: { toString: () => string } };
        if (dept && typeof dept === "object" && dept._id) {
          return dept._id.toString() === departmentId;
        }
        return course.department?.toString() === departmentId;
      });
    }

    const start = page * size;
    const content = courses.slice(start, start + size);

    res.status(200).json({
      content,
      totalPages: Math.ceil(courses.length / size) || 1,
      totalElements: courses.length,
      size,
      number: page,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const getSingleCourseById = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Course id is required",
      });
    }

    const course = await getCourseByIdService(id);
    res.status(200).json({
      success: true,
      data: course,
      message: "Course found",
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Course id is required",
      });
    }
    const course = await updateCourseService(id, req.body);
    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

export const deleteCourseById = async (req: Request, res: Response) => {
  try {
    const id = getId(req);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Course id is required",
      });
    }

    const course = await deleteCourseByIdService(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};
