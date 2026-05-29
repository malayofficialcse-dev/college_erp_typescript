import Admission from "../../Models/Core/Admission.ts";
import type { AdmissionStatus, PaymentPlan, ChequeDetails, BankTransferDetails } from "../../Interfaces/Core/index.ts";
import { generateEmiScheduleForAdmissionService } from "./AdmissionEmi.service.ts";

export interface ICreateAdmissionInput {
  admissionNumber: string;
  billNumber?: string;
  student: string;
  course: string;
  department: string;
  academicYear: string;
  admissionDate: Date;
  totalFeeAmount: number;
  discountAmount: number;
  netPayableAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentPlan: PaymentPlan;
  numberOfEmis?: number;
  advanceAmount?: number;
  advancePaymentDate?: Date;
  advancePaymentMethod?: string;
  advanceTransactionId?: string;
  advanceChequeDetails?: ChequeDetails;
  advanceBankTransferDetails?: BankTransferDetails;
  status?: AdmissionStatus;
  remarks?: string;
}

export const createAdmissionService = async (data: ICreateAdmissionInput) => {
  const existing = await Admission.findOne({
    $or: [
      { admissionNumber: data.admissionNumber },
      { student: data.student, academicYear: data.academicYear, course: data.course },
    ],
  });
  if (existing) {
    throw new Error("Admission already exists for this student in the given course/academic year");
  }
  const admission = await Admission.create(data);

  if (admission.paymentPlan === "EMI") {
    await generateEmiScheduleForAdmissionService(admission._id.toString());
  }

  return admission;
};

export const getAllAdmissionsService = async (filter: {
  department?: string;
  course?: string;
  academicYear?: string;
  status?: string;
  paymentPlan?: string;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.department) query.department = filter.department;
  if (filter.course) query.course = filter.course;
  if (filter.academicYear) query.academicYear = filter.academicYear;
  if (filter.status) query.status = filter.status;
  if (filter.paymentPlan) query.paymentPlan = filter.paymentPlan;
  return Admission.find(query)
    .populate("student", "firstName lastName enrollmentNumber email phone")
    .populate("course", "name code")
    .populate("department", "name code")
    .populate("academicYear", "name")
    .sort({ admissionDate: -1 });
};

export const getAdmissionByIdService = async (id: string) => {
  return Admission.findById(id)
    .populate("student", "firstName lastName enrollmentNumber email phone")
    .populate("course", "name code")
    .populate("department", "name code")
    .populate("academicYear", "name");
};

export const updateAdmissionService = async (
  id: string,
  data: Partial<ICreateAdmissionInput>
) => {
  const admission = await Admission.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("student", "firstName lastName enrollmentNumber")
    .populate("course", "name code");
  if (!admission) throw new Error("Admission not found");
  return admission;
};

export const deleteAdmissionService = async (id: string) => {
  const admission = await Admission.findByIdAndDelete(id);
  if (!admission) throw new Error("Admission not found");
  return admission;
};

export const getAdmissionStatsService = async () => {
  const stats = await Admission.aggregate([
    {
      $group: {
        _id: null,
        totalAdmissions: { $sum: 1 },
        totalAmountPaid: { $sum: "$amountPaid" },
        totalBalanceDue: { $sum: "$balanceDue" },
        totalNetPayable: { $sum: "$netPayableAmount" },
      }
    }
  ]);

  const defaultStats = {
    totalAdmissions: 0,
    totalAmountPaid: 0,
    totalBalanceDue: 0,
    totalNetPayable: 0
  };

  return stats.length > 0 ? stats[0] : defaultStats;
};
