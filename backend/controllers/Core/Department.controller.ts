import type { Request, Response } from "express";
import {
    createDepartmentService,
    findDepartmentByIdService,
    getAllDepartmentService,
    deleteDepartmentService,
    updateDepartmentService,
} from "../../Services/Core/Department.service.ts";

export const createDepartment = async (req: Request, res: Response) => {
    try {
        const department = await createDepartmentService(req.body);

        res.status(200).json({
            success: true,
            message: "Department created successfully",
            data: department
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

export const getDepartmentById = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Department id is required"
            });
        }

        const department = await findDepartmentByIdService(id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const deleteDepartmentById = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id) {
            return res.status(404).json({
                success:false,
                message:"Department is required"
            });
        }

        const department = await deleteDepartmentService(id);

        if(!department) {
            return res.status(404).json({
                success:false,
                message:"Department nont found"
            });
        }

        res.status(200).json({
            success:true,
            message:"Department deleted successfully"
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const updateDepartmentById = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Department id is required",
            });
        }

        const department = await updateDepartmentService(id, req.body);
        res.status(200).json({
            success: true,
            message: "Department updated successfully",
            data: department,
        });
    } catch (error: unknown) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Server error",
        });
    }
};

export const getAllDepartments = async (req:Request,res:Response) => {
    try {
        const departments = await getAllDepartmentService();
        if(!departments) {
            return res.status(404).json({
                message:"Departments not found"
            });
        }

        res.status(200).json({
            count:departments.length,
            success:true,
            data:departments

        });
    } catch (error : any) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}