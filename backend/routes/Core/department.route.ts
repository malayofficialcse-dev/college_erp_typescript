import express from "express";
import {
    getAllDepartments,
    deleteDepartmentById,
    getDepartmentById,
    createDepartment,
    updateDepartmentById,
} from "../../controllers/Core/Department.controller.ts";
import { cacheResponse, clearCache } from "../../middleware/cache.middleware.ts";

const router = express.Router();

router.post("/create", clearCache("/api/v1/department"), createDepartment);
router.post("/", clearCache("/api/v1/department"), createDepartment);
router.get("/getalldept", cacheResponse(300), getAllDepartments);
router.get("/", cacheResponse(300), getAllDepartments);
router.get("/:id", getDepartmentById);
router.put("/:id", clearCache("/api/v1/department"), updateDepartmentById);
router.delete("/:id", clearCache("/api/v1/department"), deleteDepartmentById);

export default router;