import Payroll from "../../Models/HR/Payroll.ts";
import type { PayrollStatus } from "../../Interfaces/HR/index.ts";

export interface ICreatePayrollInput {
  employee: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances?: number;
  deductions?: number;
  netSalary: number;
  transactionId?: string;
}

export const createPayrollService = async (data: ICreatePayrollInput) => {
  const existing = await Payroll.findOne({
    employee: data.employee,
    month: data.month,
    year: data.year,
  });
  if (existing) {
    throw new Error(
      "Payroll record for this employee for the given month/year already exists"
    );
  }
  return Payroll.create(data);
};

export const getAllPayrollsService = async (filter: {
  employee?: string;
  month?: number;
  year?: number;
  status?: string;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.employee) query.employee = filter.employee;
  if (filter.month) query.month = filter.month;
  if (filter.year) query.year = filter.year;
  if (filter.status) query.status = filter.status;
  return Payroll.find(query)
    .populate("employee", "firstName lastName employeeCode designation")
    .sort({ year: -1, month: -1 });
};

export const getPayrollByIdService = async (id: string) => {
  return Payroll.findById(id).populate(
    "employee",
    "firstName lastName employeeCode designation"
  );
};

export const updatePayrollStatusService = async (
  id: string,
  status: PayrollStatus,
  paidDate?: Date,
  transactionId?: string
) => {
  const payroll = await Payroll.findByIdAndUpdate(
    id,
    {
      status,
      ...(paidDate && { paidDate }),
      ...(transactionId && { transactionId }),
    },
    { new: true, runValidators: true }
  ).populate("employee", "firstName lastName employeeCode designation");

  if (!payroll) {
    throw new Error("Payroll record not found");
  }
  return payroll;
};

export const deletePayrollService = async (id: string) => {
  const payroll = await Payroll.findByIdAndDelete(id);
  if (!payroll) {
    throw new Error("Payroll record not found");
  }
  return payroll;
};
