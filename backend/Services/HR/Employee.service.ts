import Employee from "../../Models/HR/Employee.ts";
import type { EmployeeType, EmployeeStatus } from "../../Interfaces/HR/index.ts";

export interface ICreateEmployeeInput {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  employeeType?: EmployeeType;
  dateOfBirth?: Date;
  joiningDate?: Date;
  basicSalary?: number;
  address?: string;
  department?: string;
  status?: EmployeeStatus;
}
  //kecbwucb

export const createEmployeeService = async (data: ICreateEmployeeInput) => {
  const existing = await Employee.findOne({
    $or: [{ employeeCode: data.employeeCode }, { email: data.email }],
  });
  if (existing) {
    throw new Error("Employee with same code or email already exists");
  }
  return Employee.create(data);
};

export const getAllEmployeesService = async (filter: {
  department?: string;
  employeeType?: string;
  status?: string;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.department) query.department = filter.department;
  if (filter.employeeType) query.employeeType = filter.employeeType;
  if (filter.status) query.status = filter.status;
  return Employee.find(query).populate("department", "name code");
};

export const getEmployeeByIdService = async (id: string) => {
  return Employee.findById(id).populate("department", "name code");
};

export const updateEmployeeService = async (
  id: string,
  data: Partial<ICreateEmployeeInput>
) => {
  const employee = await Employee.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("department", "name code");
  if (!employee) {
    throw new Error("Employee not found");
  }
  return employee;
};

export const deleteEmployeeService = async (id: string) => {
  const employee = await Employee.findByIdAndDelete(id);
  if (!employee) {
    throw new Error("Employee not found");
  }
  return employee;
};
