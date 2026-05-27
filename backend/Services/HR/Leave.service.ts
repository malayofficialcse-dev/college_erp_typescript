import Leave from "../../Models/HR/Leave.ts";
import type { LeaveType, LeaveStatus } from "../../Interfaces/HR/index.ts";

export interface ICreateLeaveInput {
  employee: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string;
}

export const createLeaveService = async (data: ICreateLeaveInput) => {
  return Leave.create(data);
};

export const getAllLeavesService = async (filter: {
  employee?: string;
  status?: string;
  leaveType?: string;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.employee) query.employee = filter.employee;
  if (filter.status) query.status = filter.status;
  if (filter.leaveType) query.leaveType = filter.leaveType;
  return Leave.find(query)
    .populate("employee", "firstName lastName employeeCode designation")
    .populate("approvedBy", "firstName lastName employeeCode")
    .sort({ createdAt: -1 });
};

export const getLeaveByIdService = async (id: string) => {
  return Leave.findById(id)
    .populate("employee", "firstName lastName employeeCode designation")
    .populate("approvedBy", "firstName lastName employeeCode");
};

export const updateLeaveStatusService = async (
  id: string,
  status: LeaveStatus,
  approvedBy?: string,
  remarks?: string
) => {
  const leave = await Leave.findByIdAndUpdate(
    id,
    { status, ...(approvedBy && { approvedBy }), ...(remarks && { remarks }) },
    { new: true, runValidators: true }
  )
    .populate("employee", "firstName lastName employeeCode designation")
    .populate("approvedBy", "firstName lastName employeeCode");

  if (!leave) {
    throw new Error("Leave not found");
  }
  return leave;
};

export const deleteLeaveService = async (id: string) => {
  const leave = await Leave.findByIdAndDelete(id);
  if (!leave) {
    throw new Error("Leave not found");
  }
  return leave;
};
