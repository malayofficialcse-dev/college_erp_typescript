import Admission from "../../Models/Core/Admission.ts";
import Session from "../../Models/Core/Session.ts";
import type { AdmissionStatus, PaymentPlan, ChequeDetails, BankTransferDetails } from "../../Interfaces/Core/index.ts";
import { generateEmiScheduleForAdmissionService } from "./AdmissionEmi.service.ts";
import { upsertFeeRecordService } from "./Fee.service.ts";

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

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeSessionLabel = (label: string) =>
  label.trim().toUpperCase().replace(/\s+/g, "-").replace(/\//g, "-");

const getCurrentSessionLabel = async () => {
  const activeSession = await Session.findOne({ isActive: true })
    .populate("academicYear", "name")
    .sort({ updatedAt: -1, startDate: -1 });

  const fallbackSession = activeSession || await Session.findOne()
    .populate("academicYear", "name")
    .sort({ endDate: -1, updatedAt: -1 });

  const academicYearName = (fallbackSession?.academicYear as { name?: string } | undefined)?.name;
  const label = fallbackSession?.label || academicYearName || "SESSION";
  return normalizeSessionLabel(String(label));
};

const getNextBillSequence = async (sessionLabel: string) => {
  const prefix = `CLG/${sessionLabel}/`;
  const billNumbers = await Admission.find({
    billNumber: { $regex: `^${escapeRegex(prefix)}\\d{5}$` },
  })
    .select("billNumber")
    .lean();

  const highestSequence = billNumbers.reduce((max, admission) => {
    const billNumber = String(admission.billNumber || "");
    const suffix = billNumber.split("/").pop() || "";
    const sequence = Number.parseInt(suffix, 10);
    return Number.isNaN(sequence) ? max : Math.max(max, sequence);
  }, 0);

  return `${prefix}${String(highestSequence + 1).padStart(5, "0")}`;
};

const syncAdmissionPaymentToLedger = async (admission: any) => {
  const amountPaid = Number(admission.amountPaid || admission.advanceAmount || 0);
  if (amountPaid <= 0 || !admission.student) return;

  const netPayableAmount = Number(admission.netPayableAmount || 0);
  const status = netPayableAmount > 0 && amountPaid < netPayableAmount ? "PARTIAL" : "PAID";
  const reference =
    admission.advanceTransactionId ||
    admission.advanceChequeDetails?.chequeNumber ||
    admission.advanceBankTransferDetails?.accountNumber ||
    admission.billNumber ||
    admission.admissionNumber;

  await upsertFeeRecordService(
    { source: "ADVANCE", admissionId: admission._id },
    {
      student: admission.student.toString(),
      feeType: "Admission Payment",
      amount: amountPaid,
      discountAmount: Number(admission.discountAmount || 0),
      fineAmount: 0,
      paymentDate: admission.advancePaymentDate || admission.admissionDate || new Date(),
      dueDate: admission.admissionDate || new Date(),
      paymentMethod: admission.advancePaymentMethod || "CASH",
      transactionId: reference,
      status,
      remarks: `[ADVANCE] Admission ${admission.admissionNumber}${admission.remarks ? ` - ${admission.remarks}` : ""}`,
      source: "ADVANCE",
      admissionId: admission._id.toString(),
    }
  );
};

export const createAdmissionService = async (data: ICreateAdmissionInput) => {
  if (!data.billNumber) {
    const sessionLabel = await getCurrentSessionLabel();
    data.billNumber = await getNextBillSequence(sessionLabel);
  }

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
  await syncAdmissionPaymentToLedger(admission);

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
    returnDocument: "after",
    runValidators: true,
  })
    .populate("student", "firstName lastName enrollmentNumber")
    .populate("course", "name code");
  if (!admission) throw new Error("Admission not found");
  await syncAdmissionPaymentToLedger(admission);
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
