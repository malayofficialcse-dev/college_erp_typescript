import express from "express";
import {
    createCourse,
    getAllCourses,
    getSingleCourseById,
    deleteCourseById,
    searchCourses,
    updateCourse,
} from "../../controllers/Core/Course.controller.ts";

const router=express.Router();

router.get("/search", searchCourses);
router.post("/",createCourse);
router.get("/",getAllCourses);
router.get("/:id",getSingleCourseById);
router.put("/:id", updateCourse);
router.delete("/:id",deleteCourseById);

export default router;