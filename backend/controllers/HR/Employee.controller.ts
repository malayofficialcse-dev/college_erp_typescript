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

/**
 * Generate letter data for a given employee and letter type.
 * Returns structured JSON — rendering is done client-side.
 * GET /api/v1/hr/employees/:id/letter/:type
 */
export const generateEmployeeLetter = async (req: Request, res: Response) => {
  try {
    const { id, type } = req.params;
    const validTypes = ["offer", "appointment", "relieving", "contract", "experience"];

    if (!id) {
      return res.status(400).json({ success: false, message: "Employee id is required" });
    }
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid letter type. Valid types: ${validTypes.join(", ")}`,
      });
    }

    const employee = await getEmployeeByIdService(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const emp = employee as any;
    const dept = emp.department?.name || emp.department || "N/A";
    const fullName = `${emp.firstName} ${emp.lastName}`;
    const grossSalary =
      (emp.basicSalary || 0) +
      (emp.hra || 0) +
      (emp.da || 0) +
      (emp.ta || 0) +
      (emp.bonus || 0) +
      (emp.otherAllowances || 0);

    const payload = {
      type,
      employee: {
        id: emp._id || emp.id,
        fullName,
        firstName: emp.firstName,
        lastName: emp.lastName,
        employeeCode: emp.employeeCode,
        designation: emp.designation,
        department: dept,
        employeeType: emp.employeeType,
        email: emp.email,
        phone: emp.phone,
        address: emp.address,
        joiningDate: emp.joiningDate,
        relievingDate: emp.relievingDate,
        contractType: emp.contractType || "PERMANENT",
        contractEndDate: emp.contractEndDate,
        probationEndDate: emp.probationEndDate,
        basicSalary: emp.basicSalary || 0,
        hra: emp.hra || 0,
        da: emp.da || 0,
        ta: emp.ta || 0,
        bonus: emp.bonus || 0,
        otherAllowances: emp.otherAllowances || 0,
        pfDeduction: emp.pfDeduction || 0,
        taxDeduction: emp.taxDeduction || 0,
        esiDeduction: emp.esiDeduction || 0,
        otherDeductions: emp.otherDeductions || 0,
        grossSalary,
        gender: emp.gender,
        status: emp.status,
      },
      issuedDate: new Date().toISOString(),
    };

    res.status(200).json({ success: true, data: payload });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
