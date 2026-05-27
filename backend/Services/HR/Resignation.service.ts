import Resignation from "../../Models/HR/Resignation.ts";
import type { ResignationStatus } from "../../Interfaces/HR/index.ts";

export interface ICreateResignationInput {
  employee: string;
  lastWorkingDate: Date;
  reason: string;
}

export const createResignationService = async (
  data: ICreateResignationInput
) => {
  const existing = await Resignation.findOne({
    employee: data.employee,
    status: { $in: ["PENDING", "ACCEPTED"] },
  });
  if (existing) {
    throw new Error(
      "An active resignation request already exists for this employee"
    );
  }
  return Resignation.create(data);
};

export const getAllResignationsService = async (filter: {
  employee?: string;
  status?: string;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.employee) query.employee = filter.employee;
  if (filter.status) query.status = filter.status;
  return Resignation.find(query)
    .populate("employee", "firstName lastName employeeCode designation")
    .populate("reviewedBy", "firstName lastName employeeCode")
    .sort({ createdAt: -1 });
};

export const getResignationByIdService = async (id: string) => {
  return Resignation.findById(id)
    .populate("employee", "firstName lastName employeeCode designation")
    .populate("reviewedBy", "firstName lastName employeeCode");
};

export const updateResignationStatusService = async (
  id: string,
  status: ResignationStatus,
  reviewedBy?: string,
  reviewRemarks?: string
) => {
  const resignation = await Resignation.findByIdAndUpdate(
    id,
    {
      status,
      ...(reviewedBy && { reviewedBy }),
      ...(reviewRemarks && { reviewRemarks }),
    },
    { new: true, runValidators: true }
  )
    .populate("employee", "firstName lastName employeeCode designation")
    .populate("reviewedBy", "firstName lastName employeeCode");

  if (!resignation) {
    throw new Error("Resignation not found");
  }
  return resignation;
};

export const deleteResignationService = async (id: string) => {
  const resignation = await Resignation.findByIdAndDelete(id);
  if (!resignation) {
    throw new Error("Resignation not found");
  }
  return resignation;
};
