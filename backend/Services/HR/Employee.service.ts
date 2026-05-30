import Employee from "../../Models/HR/Employee.ts";
import type { EmployeeType, EmployeeStatus } from "../../Interfaces/HR/index.ts";
import UserAccountService from "../Auth/UserAccount.ts";
import { generateEmployeeCode } from "./employeeCodeGenerator.ts";
import { generateEmailFromName } from "./emailGenerator.ts";

export interface ICreateEmployeeInput {
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email?: string;
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

const userAccountService = new UserAccountService();

export const createEmployeeService = async (data: ICreateEmployeeInput) => {
  try {
    // Auto-generate employee code if not provided
    if (!data.employeeCode) {
      data.employeeCode = await generateEmployeeCode();
    }

    // Auto-generate email if not provided
    if (!data.email) {
      data.email = generateEmailFromName(data.firstName, data.lastName);
    }

    // Check for existing employee
    const existing = await Employee.findOne({
      $or: [{ employeeCode: data.employeeCode }, { email: data.email }],
    });
    if (existing) {
      throw new Error("Employee with same code or email already exists");
    }

    // Create employee
    const employee = await Employee.create(data);

    // Auto-create UserAccount
    const fullName = `${data.firstName} ${data.lastName}`;
    const tempPassword = generateTemporaryPassword();

    try {
      const userAccount = await userAccountService.createUserAccount({
        username: data.employeeCode,
        email: data.email,
        password: tempPassword,
        fullName: fullName,
        roles: ["ROLE_STAFF"],
        enabled: true,
        employee: employee._id,
      });

      return {
        employee,
        userAccount,
        tempPassword,
      };
    } catch (error) {
      // If user account creation fails, we still keep the employee but log the error
      console.error(
        "Failed to create user account for employee:",
        error instanceof Error ? error.message : "unknown error"
      );
      return {
        employee,
        userAccount: null,
        error: error instanceof Error ? error.message : "Failed to create user account",
      };
    }
  } catch (error) {
    throw new Error(
      `Failed to create employee: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
};

/**
 * Generates a temporary password (12 characters: uppercase, lowercase, numbers, special chars)
 */
const generateTemporaryPassword = (): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";

  const allChars = uppercase + lowercase + numbers + special;
  let password = "";

  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password.split("").sort(() => Math.random() - 0.5).join("");
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
