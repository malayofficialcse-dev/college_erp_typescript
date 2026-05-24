import express from "express";
import {
    createCourse,
    getAllCourses,
    getSingleCourseById,
    deleteCourseById
} from "../../controllers/Core/Course.controller.ts";

const router=express.Router();

router.post("/",createCourse);
router.get("/",getAllCourses);
router.get("/:id",getSingleCourseById);
router.delete("/:id",deleteCourseById);

export default router;