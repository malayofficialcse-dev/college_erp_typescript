import express from "express";
import {
    getAllDepartments,
    deleteDepartmentById,
    getDepartmentById,
    createDepartment
} from "../../controllers/Core/Department.controller.ts";

const router = express.Router();

router.post("/create",createDepartment);
router.get("/getalldept",getAllDepartments);
router.get("/:id",getDepartmentById);
router.delete("/:id",deleteDepartmentById);

export default router;