import express from "express";
import {
    getAllDepartments,
    deleteDepartmentById,
    getDepartmentById,
    createDepartment,
    updateDepartmentById,
} from "../../controllers/Core/Department.controller.ts";

const router = express.Router();

router.post("/create",createDepartment);
router.post("/", createDepartment);
router.get("/getalldept",getAllDepartments);
router.get("/", getAllDepartments);
router.get("/:id",getDepartmentById);
router.put("/:id", updateDepartmentById);
router.delete("/:id",deleteDepartmentById);

export default router;