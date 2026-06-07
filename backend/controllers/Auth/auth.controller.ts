import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import UserAccountService from "../../Services/Auth/UserAccount.ts";
import UserAccount from "../../Models/Auth/UserAccount.ts";
import Employee from "../../Models/HR/Employee.ts";
import Student from "../../Models/Core/Student.ts";
import { ensureUserAccountForEmployee } from "../../Services/HR/Employee.service.ts";
import { ensureUserAccountForStudent } from "../../Services/Core/Student.service.ts";

const userAccountService = new UserAccountService();

const createAccessToken = (userId: string) =>
  Buffer.from(`${userId}:${Date.now()}`).toString("base64url");

const getDepartmentPayload = (department: any) => {
  if (!department) return { departmentId: null, departmentName: null };
  if (typeof department === "string") {
    return { departmentId: department, departmentName: null };
  }
  return {
    departmentId: department._id?.toString?.() || department.id || null,
    departmentName: department.name || null,
  };
};

const findEmployeeByIdentifier = (identifier: string) => {
  const normalizedEmail = identifier.toLowerCase();
  const normalizedCode = identifier.toUpperCase();

  return Employee.findOne({
    $or: [{ email: normalizedEmail }, { employeeCode: normalizedCode }],
  });
};

const findStudentByIdentifier = (identifier: string) => {
  const normalizedEmail = identifier.toLowerCase();
  const normalizedEnrollment = identifier.toUpperCase();

  return Student.findOne({
    $or: [{ email: normalizedEmail }, { enrollmentNumber: normalizedEnrollment }],
  });
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const username =
      req.body.username ?? req.body.usernameOrEmail ?? req.body.email;
    const { password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email/employee code and password are required",
      });
    }

    const identifier = String(username).trim();
    let user = await userAccountService.authenticate(identifier, String(password));

    if (!user) {
      const employee = await findEmployeeByIdentifier(identifier);
      if (employee) {
        await ensureUserAccountForEmployee(
          String(employee._id),
          employee.employeeCode
        );
        user = await userAccountService.authenticate(
          identifier,
          String(password)
        );
      } else {
        const student = await findStudentByIdentifier(identifier);
        if (student) {
          await ensureUserAccountForStudent(
            String(student._id),
            student.enrollmentNumber
          );
          user = await userAccountService.authenticate(
            identifier,
            String(password)
          );
        }
      }
    }

    if (!user) {
      const student = await findStudentByIdentifier(identifier);
      if (student) {
        await ensureUserAccountForStudent(
          String(student._id),
          student.enrollmentNumber
        );
        user = await userAccountService.authenticate(identifier, String(password));
      }
    }

    if (!user) {
      const student = await findStudentByIdentifier(identifier);
      if (student) {
        await ensureUserAccountForStudent(
          String(student._id),
          student.enrollmentNumber
        );
        user = await userAccountService.authenticate(identifier, String(password));
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid login credentials. Use your employee or student email/code. For students, the default password is the enrollment number.",
      });
    }

    if (!user.enabled) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled. Contact administrator.",
      });
    }

    if (!user.employee && !user.student) {
      const linkedEmployee =
        (await findEmployeeByIdentifier(user.username)) ||
        (await findEmployeeByIdentifier(user.email));
      if (linkedEmployee) {
        await ensureUserAccountForEmployee(String(linkedEmployee._id));
        user = await userAccountService.getUserAccountById(String(user._id));
      } else {
        const linkedStudent =
          (await findStudentByIdentifier(user.username)) ||
          (await findStudentByIdentifier(user.email));
        if (linkedStudent) {
          await ensureUserAccountForStudent(String(linkedStudent._id));
          user = await userAccountService.getUserAccountById(String(user._id));
        }
      }
    }

    if (!user.student) {
      const linkedStudent =
        (await findStudentByIdentifier(user.username)) ||
        (await findStudentByIdentifier(user.email));
      if (linkedStudent) {
        await ensureUserAccountForStudent(String(linkedStudent._id));
        user = await userAccountService.getUserAccountById(String(user._id));
      }
    }

    if (!user.student) {
      const linkedStudent =
        (await findStudentByIdentifier(user.username)) ||
        (await findStudentByIdentifier(user.email));
      if (linkedStudent) {
        await ensureUserAccountForStudent(String(linkedStudent._id));
        user = await userAccountService.getUserAccountById(String(user._id));
      }
    }

    user = await UserAccount.findById(user._id)
      .select("-password")
      .populate("department", "name code")
      .populate({
        path: "employee",
        populate: { path: "department", select: "name code" },
      })
      .populate({
        path: "student",
        populate: { path: "department", select: "name code" },
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid login session. Please try again.",
      });
    }

    const scopedDepartment =
      getDepartmentPayload(user.department).departmentId
        ? getDepartmentPayload(user.department)
        : getDepartmentPayload((user.employee as any)?.department || (user.student as any)?.department);

    const accessToken = createAccessToken(String(user._id));

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        token: accessToken,
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        departmentId: user.roles?.includes("ROLE_ADMIN") ? null : scopedDepartment.departmentId,
        departmentName: user.roles?.includes("ROLE_ADMIN") ? null : scopedDepartment.departmentName,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
};

/* ── Change Password ─────────────────────────────────── */
export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "userId, currentPassword and newPassword are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await UserAccount.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to change password",
    });
  }
};
