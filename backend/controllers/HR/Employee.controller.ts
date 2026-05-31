import type { Request, Response } from "express";
import {
  createEmployeeService,
  getAllEmployeesService,
  getEmployeeByIdService,
  updateEmployeeService,
  deleteEmployeeService,
  ensureUserAccountForEmployee,
} from "../../Services/HR/Employee.service.ts";

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const result = await createEmployeeService(req.body);
    res.status(201).json({
      success: true,
      message:
        "Employee created. Login with employee code or email. Default password is the employee code.",
      data: {
        employee: result.employee,
        userAccount: result.userAccount
          ? {
              id: result.userAccount._id,
              username: result.userAccount.username,
              email: result.userAccount.email,
              fullName: result.userAccount.fullName,
              roles: result.userAccount.roles,
            }
          : null,
        tempPassword: result.tempPassword,
        loginHint: result.loginHint,
        error: result.error || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const { department, employeeType, status, keyword } = req.query as Record<
      string,
      string
    >;
    const page = req.query.page ? Number(req.query.page) : 0;
    const size = req.query.size ? Number(req.query.size) : 15;

    const result = await getAllEmployeesService({
      department,
      employeeType,
      status,
      keyword,
      page,
      size,
    });

    res.status(200).json({
      success: true,
      count: result.content.length,
      total: result.total,
      totalPages: result.totalPages,
      page: result.page,
      data: result.content,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Employee id is required" });
    }
    const employee = await getEmployeeByIdService(id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Employee id is required" });
    }
    const employee = await updateEmployeeService(id, req.body);
    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Employee id is required" });
    }
    await deleteEmployeeService(id);
    res
      .status(200)
      .json({ success: true, message: "Employee deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmployeeUserAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Employee id is required" });
    }

    const result = await ensureUserAccountForEmployee(
      id,
      req.body?.password
    );

    res.status(result.created ? 201 : 200).json({
      success: true,
      message: result.created
        ? "User account created successfully"
        : "User account already exists",
      data: {
        userAccount: result.userAccount
          ? {
              id: result.userAccount._id,
              username: result.userAccount.username,
              email: result.userAccount.email,
              fullName: result.userAccount.fullName,
              roles: result.userAccount.roles,
            }
          : null,
        tempPassword: result.tempPassword,
        created: result.created,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
