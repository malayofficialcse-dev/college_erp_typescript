import AdmissionEmi from "../../Models/Core/AdmissionEmi.ts";
import Admission from "../../Models/Core/Admission.ts";
import { upsertFeeRecordService } from "./Fee.service.ts";
import type {
  EmiStatus,
  PaymentMethod,
  ChequeDetails,
  BankTransferDetails,
} from "../../Interfaces/Core/index.ts";

export interface ICreateAdmissionEmiInput {
  admission: string;
  emiNumber: number;
  emiAmount: number;
  dueDate: Date;
  semester?: number;
  paidAmount?: number;
  paidDate?: Date;
  fineAmount?: number;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  receiptNumber?: string;
  status?: EmiStatus;
  remarks?: string;
  chequeDetails?: ChequeDetails;
  bankTransferDetails?: BankTransferDetails;
}

export interface IUpdatePaymentInput {
  status?: EmiStatus;
  paidAmount?: number;
  paidDate?: Date;
  fineAmount?: number;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  receiptNumber?: string;
  remarks?: string;
  carryOverAmount?: number;
  chequeDetails?: ChequeDetails;
  bankTransferDetails?: BankTransferDetails;
}

export const validatePaymentMethod = (
  method: PaymentMethod,
  data: IUpdatePaymentInput
): { valid: boolean; error?: string } => {
  if (!method) return { valid: true };

  if (method === "CHEQUE") {
    const cheque = data.chequeDetails;
    if (!cheque?.bankName || !cheque?.holderName || !cheque?.chequeNumber || !cheque?.chequeDate) {
      return {
        valid: false,
        error: "For cheque payments, bank name, holder name, cheque number, and date are required",
      };
    }
  }

  if (method === "BANK_TRANSFER") {
    const bank = data.bankTransferDetails;
    if (!bank?.bankName || !bank?.accountHolder || !bank?.accountNumber || !bank?.ifscCode) {
      return {
        valid: false,
        error: "For bank transfer, bank name, account holder, account number, and IFSC code are required",
      };
    }
  }

  if (["UPI", "CARD", "BANK_TRANSFER"].includes(method)) {
    if (!data.transactionId || data.transactionId.trim() === "") {
      return {
        valid: false,
        error: `Transaction ID is required for ${method} payments`,
      };
    }
  }

  return { valid: true };
};

export const createAdmissionEmiService = async (
  data: ICreateAdmissionEmiInput
) => {
  const existing = await AdmissionEmi.findOne({
    admission: data.admission,
    emiNumber: data.emiNumber,
  });
  if (existing) {
    throw new Error("EMI record already exists for this admission and EMI number");
  }
  return AdmissionEmi.create(data);
};

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

export const generateEmiScheduleForAdmissionService = async (admissionId: string) => {
  const admission = await Admission.findById(admissionId);
  if (!admission) throw new Error("Admission not found");
  if (admission.paymentPlan !== "EMI") throw new Error("Admission is not configured for EMI payments");

  const numberOfEmis = Number(admission.numberOfEmis || 0);
  if (!numberOfEmis || numberOfEmis < 1) {
    throw new Error("Number of EMIs is required to generate installment schedule");
  }

  const existing = await AdmissionEmi.find({ admission: admission._id }).sort({ emiNumber: 1 });
  const existingNumbers = new Set(existing.map((emi) => emi.emiNumber));
  const balanceDue = Math.max(Number(admission.balanceDue || 0), 0);
  const baseAmount = Math.floor((balanceDue / numberOfEmis) * 100) / 100;
  const created = [];

  for (let emiNumber = 1; emiNumber <= numberOfEmis; emiNumber += 1) {
    if (existingNumbers.has(emiNumber)) continue;

    const isLast = emiNumber === numberOfEmis;
    const emiAmount = isLast
      ? Math.round((balanceDue - baseAmount * (numberOfEmis - 1)) * 100) / 100
      : baseAmount;

    created.push({
      admission: admission._id.toString(),
      emiNumber,
      emiAmount,
      dueDate: addMonths(new Date(admission.admissionDate || new Date()), emiNumber),
      status: "PENDING" as EmiStatus,
    });
  }

  if (created.length > 0) {
    await AdmissionEmi.insertMany(created, { ordered: false });
  }

  return getEmisByAdmissionService(admissionId);
};

export const getEmisByAdmissionService = async (admissionId: string) => {
  return AdmissionEmi.find({ admission: admissionId })
    .populate("admission", "admissionNumber student")
    .sort({ emiNumber: 1 });
};

export const getAllEmisService = async (filter: {
  admission?: string;
  status?: string;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.admission) query.admission = filter.admission;
  if (filter.status) query.status = filter.status;
  return AdmissionEmi.find(query)
    .populate("admission", "admissionNumber billNumber")
    .sort({ dueDate: 1 });
};

export const getEmiByIdService = async (id: string) => {
  return AdmissionEmi.findById(id).populate(
    "admission",
    "admissionNumber student course"
  );
};

export const getNextEmiService = async (admissionId: string, currentEmiNumber: number) => {
  return AdmissionEmi.findOne({
    admission: admissionId,
    emiNumber: currentEmiNumber + 1,
  });
};

export const handlePartialPaymentService = async (
  id: string,
  paidAmount: number,
  dueAmount: number
): Promise<{ carryOver: number; status: EmiStatus }> => {
  if (paidAmount >= dueAmount) {
    return { carryOver: 0, status: "PAID" };
  }

  const remainder = dueAmount - paidAmount;
  return { carryOver: remainder, status: "PARTIAL" };
};

export const updateEmiPaymentService = async (
  id: string,
  data: IUpdatePaymentInput
) => {
  const emi = await AdmissionEmi.findById(id);
  if (!emi) throw new Error("EMI record not found");
  const previousPaidAmount = Number(emi.paidAmount || 0);

  if (data.paymentMethod) {
    const validation = validatePaymentMethod(data.paymentMethod, data);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
  }

  const dueAmount = emi.emiAmount + (emi.fineAmount || 0) + (emi.carryOverAmount || 0);
  const paidAmount = data.paidAmount || 0;

  if (paidAmount > 0) {
    const { carryOver, status } = await handlePartialPaymentService(
      id,
      paidAmount,
      dueAmount
    );

    data.status = status;
    data.carryOverAmount = carryOver;

    if (carryOver > 0 && status === "PARTIAL") {
      const nextEmi = await getNextEmiService(
        emi.admission.toString(),
        emi.emiNumber
      );
      if (nextEmi) {
        await AdmissionEmi.findByIdAndUpdate(nextEmi._id, {
          carryOverAmount: (nextEmi.carryOverAmount || 0) + carryOver,
        });
      }
    }
  }

  const updatedEmi = await AdmissionEmi.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  }).populate("admission", "admissionNumber student");

  if (!updatedEmi) throw new Error("EMI record not found");

  const nextPaidAmount = Number(updatedEmi.paidAmount || 0);
  const paidDelta = nextPaidAmount - previousPaidAmount;
  if (paidDelta !== 0) {
    const parentAdmission = await Admission.findById(emi.admission.toString());
    if (parentAdmission) {
      const newAmountPaid = Math.max(Number(parentAdmission.amountPaid || 0) + paidDelta, 0);
      const newBalanceDue = Math.max(Number(parentAdmission.balanceDue || 0) - paidDelta, 0);
      await Admission.findByIdAndUpdate(emi.admission.toString(), {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
      });
    }
  }

  if (nextPaidAmount > 0) {
    try {
      const admissionDoc = await Admission.findById(emi.admission).select("student");
      if (admissionDoc?.student) {
        const chequeRef = data.chequeDetails?.chequeNumber
          ? `CHQ-${data.chequeDetails.chequeNumber}`
          : data.transactionId || updatedEmi.transactionId || undefined;

        await upsertFeeRecordService(
          { source: "EMI", emiId: updatedEmi._id },
          {
            student: admissionDoc.student.toString(),
            feeType: `EMI #${emi.emiNumber} Payment`,
            amount: nextPaidAmount,
            discountAmount: 0,
            fineAmount: Number(updatedEmi.fineAmount || 0),
            paymentDate: updatedEmi.paidDate || data.paidDate || new Date(),
            dueDate: updatedEmi.dueDate,
            paymentMethod: (updatedEmi.paymentMethod || data.paymentMethod || "CASH") as string,
            transactionId: chequeRef,
            status: updatedEmi.status === "PAID" ? "PAID" : "PARTIAL",
            remarks: `[EMI] Admission EMI #${emi.emiNumber}${updatedEmi.remarks ? ` - ${updatedEmi.remarks}` : ""}`,
            source: "EMI",
            admissionId: emi.admission.toString(),
            emiId: updatedEmi._id.toString(),
          }
        );
      }
    } catch (feeErr) {
      console.warn("[AdmissionEmi] Could not mirror payment to Fee ledger:", feeErr);
    }
  }

  return updatedEmi;
};

export const deleteEmiService = async (id: string) => {
  const emi = await AdmissionEmi.findByIdAndDelete(id);
  if (!emi) throw new Error("EMI record not found");
  return emi;
};
