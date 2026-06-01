import Employee from "../../Models/HR/Employee.ts";
import UserAccount from "../../Models/Auth/UserAccount.ts";
import type { EmployeeType, EmployeeStatus } from "../../Interfaces/HR/index.ts";
import UserAccountService from "../Auth/UserAccount.ts";
import { seedDefaultPermissions } from "../Auth/UserPermission.service.ts";
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
  hra?: number;
  da?: number;
  ta?: number;
  bonus?: number;
  otherAllowances?: number;
  pfDeduction?: number;
  taxDeduction?: number;
  esiDeduction?: number;
  otherDeductions?: number;
  address?: string;
  department?: string;
  status?: EmployeeStatus;
}

const userAccountService = new UserAccountService();

const mapEmployeeTypeToRoles = (employeeType?: EmployeeType): string[] => {
  switch (employeeType) {
    case "ADMIN":
      return ["ROLE_ADMIN", "ROLE_STAFF"];
    case "TEACHING":
      return ["ROLE_TEACHER", "ROLE_STAFF"];
    default:
      return ["ROLE_STAFF"];
  }
};

export const ensureUserAccountForEmployee = async (
  employeeId: string,
  password?: string
) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }

  const initialPassword = password ?? employee.employeeCode;
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const roles = mapEmployeeTypeToRoles(employee.employeeType);
  const email = employee.email.toLowerCase().trim();
  const username = employee.employeeCode.toUpperCase().trim();

  const userAccount = await UserAccount.findOne({ employee: employee._id });

  const existingAccount =
    userAccount ||
    (await UserAccount.findOne({
      $or: [{ email }, { username }],
    }));

  if (existingAccount) {
    await userAccountService.updateUserAccount(String(existingAccount._id), {
      username,
      email,
      fullName,
      roles,
      enabled: true,
      employee: employee._id,
      ...(password ? { password } : {}),
    });

    await seedDefaultPermissions(String(existingAccount._id), roles);

    return {
      userAccount: await UserAccount.findById(existingAccount._id).select("-password"),
      tempPassword: password ?? null,
      created: false,
    };
  }

  const createdAccount = await userAccountService.createUserAccount({
    username,
    email,
    password: initialPassword,
    fullName,
    roles,
    enabled: true,
    employee: employee._id,
  });

  await seedDefaultPermissions(String(createdAccount._id), roles);

  return {
    userAccount: createdAccount,
    tempPassword: initialPassword,
    created: true,
  };
};

export const createEmployeeService = async (data: ICreateEmployeeInput) => {
  if (!data.employeeCode) {
    data.employeeCode = await generateEmployeeCode();
  }

  if (!data.email) {
    data.email = generateEmailFromName(data.firstName, data.lastName);
  }

  data.employeeCode = data.employeeCode.toUpperCase().trim();
  data.email = data.email.toLowerCase().trim();

  const existing = await Employee.findOne({
    $or: [{ employeeCode: data.employeeCode }, { email: data.email }],
  });
  if (existing) {
    throw new Error("Employee with same code or email already exists");
  }

  const employee = await Employee.create(data);

  try {
    const accountResult = await ensureUserAccountForEmployee(
      String(employee._id)
    );

    if (!accountResult.userAccount) {
      await Employee.findByIdAndDelete(employee._id);
      throw new Error("Failed to create login account for employee");
    }

    return {
      employee,
      userAccount: accountResult.userAccount,
      tempPassword: accountResult.tempPassword,
      loginHint: {
        username: accountResult.userAccount.username,
        email: accountResult.userAccount.email,
        password: accountResult.tempPassword,
      },
      error: null,
    };
  } catch (error) {
    await Employee.findByIdAndDelete(employee._id);
    throw new Error(
      `Failed to create employee login account: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
  }
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
    const ids = filter.department.split(",").map((s) => s.trim()).filter(Boolean);
    query.department = ids.length === 1 ? ids[0] : { $in: ids };
  }
  if (filter.employeeType) {
    const types = filter.employeeType.split(",").map((s) => s.trim()).filter(Boolean);
    query.employeeType = types.length === 1 ? types[0] : { $in: types };
  }
  if (filter.status) {
    const statuses = filter.status.split(",").map((s) => s.trim()).filter(Boolean);
    query.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
  }
  if (filter.keyword) {
    const rx = { $regex: filter.keyword, $options: "i" };
    query.$or = [
      { firstName: rx },
      { lastName: rx },
      { email: rx },
      { employeeCode: rx },
      { phone: rx },
      { designation: rx },
    ];
  }

  const page = Math.max(filter.page ?? 0, 0);
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

  await ensureUserAccountForEmployee(String(employee._id));
  return employee;
};

export const deleteEmployeeService = async (id: string) => {
  const employee = await Employee.findByIdAndDelete(id);
  if (!employee) {
    throw new Error("Employee not found");
  }

  await UserAccount.findOneAndDelete({ employee: employee._id });
  return employee;
};

export const repairEmployeeLoginAccounts = async () => {
  const employees = await Employee.find();
  const results = [];

  for (const employee of employees) {
    const result = await ensureUserAccountForEmployee(String(employee._id));
    results.push({
      employeeCode: employee.employeeCode,
      email: employee.email,
      created: result.created,
      username: result.userAccount?.username,
    });
  }

  return results;
};
