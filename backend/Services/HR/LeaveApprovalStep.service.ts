import LeaveApprovalStep from "../../Models/HR/LeaveApprovalStep.ts";
import type { ApprovalStepStatus } from "../../Interfaces/HR/index.ts";

export interface ICreateLeaveApprovalStepInput {
  leave: string;
  approver: string;
  stepOrder: number;
}

export const createLeaveApprovalStepService = async (
  data: ICreateLeaveApprovalStepInput
) => {
  return LeaveApprovalStep.create(data);
};

export const getApprovalStepsByLeaveService = async (leaveId: string) => {
  return LeaveApprovalStep.find({ leave: leaveId })
    .populate("approver", "firstName lastName employeeCode designation")
    .sort({ stepOrder: 1 });
};

export const getLeaveApprovalStepByIdService = async (id: string) => {
  return LeaveApprovalStep.findById(id)
    .populate("leave")
    .populate("approver", "firstName lastName employeeCode designation");
};

export const updateLeaveApprovalStepStatusService = async (
  id: string,
  status: ApprovalStepStatus,
  remarks?: string
) => {
  const step = await LeaveApprovalStep.findByIdAndUpdate(
    id,
    {
      status,
      actionDate: new Date(),
      ...(remarks && { remarks }),
    },
    { new: true, runValidators: true }
  )
    .populate("leave")
    .populate("approver", "firstName lastName employeeCode designation");

  if (!step) {
    throw new Error("Leave approval step not found");
  }
  return step;
};

export const deleteLeaveApprovalStepService = async (id: string) => {
  const step = await LeaveApprovalStep.findByIdAndDelete(id);
  if (!step) {
    throw new Error("Leave approval step not found");
  }
  return step;
};
