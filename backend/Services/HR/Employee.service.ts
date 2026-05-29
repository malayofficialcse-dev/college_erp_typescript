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
  keyword?: string;
  page?: number;
  size?: number;
}) => {
  const query: Record<string, unknown> = {};

  if (filter.department) {
    const ids = filter.department.split(',').map(s => s.trim()).filter(Boolean);
    query.department = ids.length === 1 ? ids[0] : { $in: ids };
  }
  if (filter.employeeType) {
    const types = filter.employeeType.split(',').map(s => s.trim()).filter(Boolean);
    query.employeeType = types.length === 1 ? types[0] : { $in: types };
  }
  if (filter.status) {
    const statuses = filter.status.split(',').map(s => s.trim()).filter(Boolean);
    query.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
  }
  if (filter.keyword) {
    const rx = { $regex: filter.keyword, $options: 'i' };
    query.$or = [
      { firstName: rx },
      { lastName: rx },
      { email: rx },
      { employeeCode: rx },
      { phone: rx },
      { designation: rx }
    ];
  }

  const page = Math.max((filter.page ?? 0), 0);
  const size = Math.min(filter.size ?? 15, 1000);
  const skip = page * size;

  const [employees, total] = await Promise.all([
    Employee.find(query)
      .populate("department", "name code")
      .sort({ employeeCode: 1 })
      .skip(skip)
      .limit(size),
    Employee.countDocuments(query),
  ]);

  return {
    content: employees,
    total,
    page,
    size,
    totalPages: Math.ceil(total / size),
  };
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
