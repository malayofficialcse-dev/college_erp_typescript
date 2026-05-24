import mongoose from "mongoose";
import {
    createCourseService,
    getAllCoursesByIdServices,
    getCourseByIdService,
    deleteCourseByIdService
} from "../../Services/Core/Course.service.ts";
import type { Request,Response } from "express";
import Course from "../../Models/Core/Courses.ts";

export const createCourse = async (req:Request,res:Response) => {
    try {
        const course = await createCourseService(req.body);
        res.status(200).json({
            success:true,
            data:course,
            message:"Course created successfully"
        });
  
    } catch (error : any) {
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

export const getAllCourses = async (req:Request,res:Response) => {
    try{
        const courses = await getAllCoursesByIdServices();
        res.status(200).json({
            message:`${courses.length} Courses found`,
            success:true,
            data:courses,
        });
    } catch (error:any) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

export const getSingleCourseById = async (req:Request,res:Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        if(!id) {
            return res.status(404).json({
                success:false,
                message:"Course id is required"
            });
        }

        const course = await getCourseByIdService(id);

        if(!course) {
            throw new Error ("Course not found");
        }

        res.status(200).json({
            success:true,
            data:course,
            message:"Found one course"
        }); 
    } catch (error : any) {
        res.status(500).json(
            {
                succuss:false,
                message:error.message
            }
        )
    }
}

export const deleteCourseById = async (req:Request,res:Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if(!id) {
            res.status(404).json({
                success:false,
                message:"Course id is required to delete the course"
            });
        }

        const department = await deleteCourseByIdService(id);

        if(!department) {
            res.status(404).json({
                success:true,
                message:"Course not found",
            });
        }

        res.status(200).json({
            success:true,
            message:"Course deleted successfully",
        });
    } catch (error : any) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}