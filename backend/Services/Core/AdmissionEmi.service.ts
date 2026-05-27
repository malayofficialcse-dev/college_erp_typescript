import AdmissionEmi from "../../Models/Core/AdmissionEmi.ts";
import type { EmiStatus, PaymentMethod } from "../../Interfaces/Core/index.ts";

export interface ICreateAdmissionEmiInput {
  admission: string;
  emiNumber: number;
  emiAmount: number;
  dueDate: Date;
  paidAmount?: number;
  paidDate?: Date;
  fineAmount?: number;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  receiptNumber?: string;
  status?: EmiStatus;
  remarks?: string;
}

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

export const updateEmiPaymentService = async (
  id: string,
  data: {
    status?: EmiStatus;
    paidAmount?: number;
    paidDate?: Date;
    fineAmount?: number;
    paymentMethod?: PaymentMethod;
    transactionId?: string;
    receiptNumber?: string;
    remarks?: string;
  }
) => {
  const emi = await AdmissionEmi.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("admission", "admissionNumber student");
  if (!emi) throw new Error("EMI record not found");
  return emi;
};

export const deleteEmiService = async (id: string) => {
  const emi = await AdmissionEmi.findByIdAndDelete(id);
  if (!emi) throw new Error("EMI record not found");
  return emi;
};
