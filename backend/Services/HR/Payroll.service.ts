import Employee from "../../Models/HR/Employee.ts";
import Payroll from "../../Models/HR/Payroll.ts";
import type { PayrollStatus } from "../../Interfaces/HR/index.ts";

export interface ICreatePayrollInput {
  employee: string | { id?: string | number; _id?: string | number };
  month: number;
  year: number;
  basicSalary: number;
  grossSalary?: number;
  hra?: number;
  da?: number;
  ta?: number;
  bonus?: number;
  otherAllowances?: number;
  allowances?: number;
  pfDeduction?: number;
  taxDeduction?: number;
  esiDeduction?: number;
  otherDeductions?: number;
  deductions?: number;
  netSalary: number;
  transactionId?: string;
}

export interface IGeneratePayrollInput {
  employee: string;
  month: number;
  year: number;
}

const roundMoney = (value: number) => Number(value.toFixed(2));

const sumMoney = (...values: Array<number | undefined | null>) =>
  roundMoney(values.reduce((total, value) => total + Number(value ?? 0), 0));

const resolveEmployeeId = (
  employee: string | { id?: string | number; _id?: string | number }
) => {
  if (typeof employee === "string") {
    return employee;
  }

  const employeeId = employee.id ?? employee._id;
  return employeeId ? String(employeeId) : "";
};

const resolveStructuredAmount = (
  amount: number | undefined | null,
  fallback: number
) => roundMoney(Number(amount ?? fallback));

const buildPayrollBreakdown = (employee: {
  basicSalary?: number | null;
  hra?: number | null;
  da?: number | null;
  ta?: number | null;
  bonus?: number | null;
  otherAllowances?: number | null;
  pfDeduction?: number | null;
  taxDeduction?: number | null;
  esiDeduction?: number | null;
  otherDeductions?: number | null;
}) => {
  const normalizedBasicSalary = roundMoney(Number(employee.basicSalary ?? 0));
  const hra = resolveStructuredAmount(employee.hra, normalizedBasicSalary * 0.2);
  const da = resolveStructuredAmount(employee.da, normalizedBasicSalary * 0.12);
  const ta = resolveStructuredAmount(employee.ta, normalizedBasicSalary * 0.05);
  const otherAllowances = resolveStructuredAmount(
    employee.otherAllowances,
    normalizedBasicSalary * 0.03
  );
  const bonus = resolveStructuredAmount(employee.bonus, 0);
  const grossSalary = roundMoney(
    normalizedBasicSalary + hra + da + ta + otherAllowances + bonus
  );

  const pfDeduction = resolveStructuredAmount(
    employee.pfDeduction,
    normalizedBasicSalary * 0.12
  );
  const taxDeduction = resolveStructuredAmount(employee.taxDeduction, grossSalary * 0.05);
  const esiDeduction = resolveStructuredAmount(
    employee.esiDeduction,
    grossSalary <= 21000 ? grossSalary * 0.0075 : 0
  );
  const otherDeductions = resolveStructuredAmount(employee.otherDeductions, 0);
  const allowances = sumMoney(hra, da, ta, otherAllowances, bonus);
  const deductions = sumMoney(pfDeduction, taxDeduction, esiDeduction, otherDeductions);
  const netSalary = roundMoney(Math.max(grossSalary - deductions, 0));

  return {
    basicSalary: normalizedBasicSalary,
    grossSalary,
    hra,
    da,
    ta,
    bonus,
    otherAllowances,
    allowances,
    pfDeduction,
    taxDeduction,
    esiDeduction,
    otherDeductions,
    deductions,
    netSalary,
  };
};

export const createPayrollService = async (data: ICreatePayrollInput) => {
  const employeeId = resolveEmployeeId(data.employee);
  if (!employeeId) {
    throw new Error("Employee is required");
  }

  const basicSalary = roundMoney(Number(data.basicSalary ?? 0));
  const allowances =
    data.allowances !== undefined
      ? roundMoney(Number(data.allowances))
      : sumMoney(data.hra, data.da, data.ta, data.bonus, data.otherAllowances);
  const deductions =
    data.deductions !== undefined
      ? roundMoney(Number(data.deductions))
      : sumMoney(
          data.pfDeduction,
          data.taxDeduction,
          data.esiDeduction,
          data.otherDeductions
        );
  const grossSalary = roundMoney(
    Number(data.grossSalary ?? basicSalary + allowances)
  );
  const netSalary = roundMoney(Number(data.netSalary ?? grossSalary - deductions));

  const existing = await Payroll.findOne({
    employee: employeeId,
    month: data.month,
    year: data.year,
  });
  if (existing) {
    throw new Error(
      "Payroll record for this employee for the given month/year already exists"
    );
  }

  const payroll = await Payroll.create({
    employee: employeeId,
    month: data.month,
    year: data.year,
    basicSalary,
    grossSalary,
    hra: roundMoney(Number(data.hra ?? 0)),
    da: roundMoney(Number(data.da ?? 0)),
    ta: roundMoney(Number(data.ta ?? 0)),
    bonus: roundMoney(Number(data.bonus ?? 0)),
    otherAllowances: roundMoney(Number(data.otherAllowances ?? 0)),
    allowances,
    pfDeduction: roundMoney(Number(data.pfDeduction ?? 0)),
    taxDeduction: roundMoney(Number(data.taxDeduction ?? 0)),
    esiDeduction: roundMoney(Number(data.esiDeduction ?? 0)),
    otherDeductions: roundMoney(Number(data.otherDeductions ?? 0)),
    deductions,
    netSalary,
    transactionId: data.transactionId,
  });

  return payroll;
};

export const generatePayrollForEmployeeService = async (
  input: IGeneratePayrollInput
) => {
  const employee = await Employee.findById(input.employee).select(
    "firstName lastName employeeCode designation basicSalary hra da ta bonus otherAllowances pfDeduction taxDeduction esiDeduction otherDeductions department"
  );
  if (!employee) {
    throw new Error("Employee not found");
  }

  const baseSalary = Number(employee.basicSalary ?? 0);
  if (!baseSalary || baseSalary <= 0) {
    throw new Error("Employee basic salary is not configured");
  }

  const existing = await Payroll.findOne({
    employee: employee._id,
    month: input.month,
    year: input.year,
  }).populate("employee", "firstName lastName employeeCode designation basicSalary department");

  if (existing) {
    return { payroll: existing, created: false };
  }

  const breakdown = buildPayrollBreakdown(employee);
  const payroll = await createPayrollService({
    employee: String(employee._id),
    month: input.month,
    year: input.year,
    ...breakdown,
  });

  const populatedPayroll = await Payroll.findById(payroll._id).populate(
    "employee",
    "firstName lastName employeeCode designation basicSalary department"
  );

  return {
    payroll: populatedPayroll ?? payroll,
    created: true,
  };
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
