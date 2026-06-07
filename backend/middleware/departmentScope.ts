import type { NextFunction, Request, Response } from "express";
import UserAccount from "../Models/Auth/UserAccount.ts";

type PopulatedDepartment = {
  _id?: { toString: () => string };
  id?: string;
};

type PopulatedProfile = {
  department?: PopulatedDepartment | string | null;
};

const getDepartmentId = (profile?: PopulatedProfile | null) => {
  const department = profile?.department;
  if (!department) return null;
  if (typeof department === "string") return department;
  return department._id?.toString() || department.id || null;
};

const decodeUserId = (authorization?: string) => {
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;
  if (!token) return null;

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    return decoded.split(":")[0] || null;
  } catch {
    return null;
  }
};

const scopedBodyMethods = new Set(["POST", "PUT", "PATCH"]);

const setScopedDepartmentOnBody = (body: Record<string, unknown>, departmentId: string) => {
  if (!body || typeof body !== "object") return;

  if ("departmentId" in body) body.departmentId = departmentId;
  if ("department" in body) body.department = departmentId;
};

export const attachDepartmentScope = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const userId = decodeUserId(req.headers.authorization);
    if (!userId) return next();

    const user = await UserAccount.findById(userId)
      .select("roles department employee student")
      .populate("department", "_id")
      .populate({
        path: "employee",
        select: "department",
        populate: { path: "department", select: "_id" },
      })
      .populate({
        path: "student",
        select: "department",
        populate: { path: "department", select: "_id" },
      })
      .lean();

    if (!user || user.roles?.includes("ROLE_ADMIN")) return next();

    const departmentId =
      getDepartmentId(user as PopulatedProfile) ||
      getDepartmentId(user.employee as PopulatedProfile) ||
      getDepartmentId(user.student as PopulatedProfile);

    if (!departmentId) return next();

    req.query.department = departmentId;
    req.query.departmentId = departmentId;

    if (scopedBodyMethods.has(req.method)) {
      setScopedDepartmentOnBody(req.body, departmentId);
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
