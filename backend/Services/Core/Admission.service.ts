import Admission from "../../Models/Core/Admission.ts";
import type { AdmissionStatus, PaymentPlan } from "../../Interfaces/Core/index.ts";

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
  return Admission.create(data);
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
