import type { Request, Response } from "express";
import {
  createPayrollService,
  getAllPayrollsService,
  getPayrollByIdService,
  updatePayrollStatusService,
  deletePayrollService,
  generatePayrollForEmployeeService,
} from "../../Services/HR/Payroll.service.ts";
import type { PayrollStatus } from "../../Interfaces/HR/index.ts";

const toSingleValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const createPayroll = async (req: Request, res: Response) => {
  try {
    const payroll = await createPayrollService(req.body);
    res.status(201).json({
      success: true,
      message: "Payroll record created successfully",
      data: payroll,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPayrolls = async (req: Request, res: Response) => {
  try {
    const employee = toSingleValue(req.query.employee as string | string[] | undefined);
    const status = toSingleValue(req.query.status as string | string[] | undefined);
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const payrolls = await getAllPayrollsService({
      employee,
      month,
      year,
      status,
    });
    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generatePayroll = async (req: Request, res: Response) => {
  try {
    const { employee, month, year } = req.body as {
      employee?: string | string[];
      month?: number;
      year?: number;
    };

    const employeeId = toSingleValue(employee);

    if (!employeeId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "Employee, month and year are required",
      });
    }

    const result = await generatePayrollForEmployeeService({
      employee: employeeId,
      month: Number(month),
      year: Number(year),
    });

    res.status(result.created ? 201 : 200).json({
      success: true,
      message: result.created
        ? "Payslip generated successfully"
        : "Payslip already exists for the selected month",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPayrollById = async (req: Request, res: Response) => {
  try {
    const id = toSingleValue(req.params.id);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Payroll id is required" });
    }
    const payroll = await getPayrollByIdService(id);
    if (!payroll) {
      return res
        .status(404)
        .json({ success: false, message: "Payroll record not found" });
    }
    res.status(200).json({ success: true, data: payroll });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePayrollStatus = async (req: Request, res: Response) => {
  try {
    const id = toSingleValue(req.params.id);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Payroll id is required" });
    }
    const { status, paidDate, transactionId } = req.body as {
      status: PayrollStatus;
      paidDate?: string;
      transactionId?: string;
    };
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }
    const payroll = await updatePayrollStatusService(
      id,
      status,
      paidDate ? new Date(paidDate) : undefined,
      transactionId
    );
    res.status(200).json({
      success: true,
      message: "Payroll status updated successfully",
      data: payroll,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePayroll = async (req: Request, res: Response) => {
  try {
    const id = toSingleValue(req.params.id);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Payroll id is required" });
    }
    await deletePayrollService(id);
    res
      .status(200)
      .json({ success: true, message: "Payroll record deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
