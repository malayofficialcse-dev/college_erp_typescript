import Course from "../../Models/Core/Courses.ts";
import mongoose from "mongoose";

export const createCourseService = async (data:any) => {
    const courseCode = await Course.findOne({
        code:data.code
    });
 
    if(courseCode) {
        throw new Error ("Course already exists");
    }

    const course = await Course.create(data);
    
    return course;
}

export const getAllCoursesByIdServices = async (data:any) => {
    const course = await Course.find();
    return course;
}

export const getCourseByIdService = async (id:string) => {
    const course = await Course.findById(id);

    if(!course) {
        throw new Error ("Course not found");
    }

    return course;
}

export const deleteCourseByIdService = async (id:string) => {
    const course = await Course.findById(id);

    if(!course) {
        throw new Error("Course not found");
    }

    return await Course.findByIdAndDelete(id);
}