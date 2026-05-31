import type { Request, Response } from "express";
import UserAccountService from "../../Services/Auth/UserAccount.ts";
import Employee from "../../Models/HR/Employee.ts";
import { ensureUserAccountForEmployee } from "../../Services/HR/Employee.service.ts";

const userAccountService = new UserAccountService();

const createAccessToken = (userId: string) =>
  Buffer.from(`${userId}:${Date.now()}`).toString("base64url");

const findEmployeeByIdentifier = (identifier: string) => {
  const normalizedEmail = identifier.toLowerCase();
  const normalizedCode = identifier.toUpperCase();

  return Employee.findOne({
    $or: [{ email: normalizedEmail }, { employeeCode: normalizedCode }],
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
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid login credentials. Use your employee code or email. Default password is your employee code.",
      });
    }

    if (!user.enabled) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled. Contact administrator.",
      });
    }

    if (!user.employee) {
      const linkedEmployee =
        (await findEmployeeByIdentifier(user.username)) ||
        (await findEmployeeByIdentifier(user.email));
      if (linkedEmployee) {
        await ensureUserAccountForEmployee(String(linkedEmployee._id));
        user = await userAccountService.getUserAccountById(String(user._id));
      }
    }

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
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
};
