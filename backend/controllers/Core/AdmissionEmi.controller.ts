import type { Request, Response } from "express";
import {
  createAdmissionEmiService,
  getEmisByAdmissionService,
  getAllEmisService,
  getEmiByIdService,
  updateEmiPaymentService,
  deleteEmiService,
  validatePaymentMethod,
  type IUpdatePaymentInput,
} from "../../Services/Core/AdmissionEmi.service.ts";

export const createAdmissionEmi = async (req: Request, res: Response) => {
  try {
    const emi = await createAdmissionEmiService(req.body);
    res.status(201).json({ success: true, message: "EMI record created successfully", data: emi });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmisByAdmission = async (req: Request, res: Response) => {
  try {
    const { admissionId } = req.params;
    if (!admissionId) return res.status(400).json({ success: false, message: "Admission id is required" });
    const emis = await getEmisByAdmissionService(admissionId);
    res.status(200).json({ success: true, count: emis.length, data: emis });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllEmis = async (req: Request, res: Response) => {
  try {
    const { admission, status } = req.query as Record<string, string>;
    const emis = await getAllEmisService({ admission, status });
    res.status(200).json({ success: true, count: emis.length, data: emis });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmiById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "EMI id is required" });
    const emi = await getEmiByIdService(id);
    if (!emi) return res.status(404).json({ success: false, message: "EMI record not found" });
    res.status(200).json({ success: true, data: emi });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmiPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "EMI id is required" });

    const paymentData: IUpdatePaymentInput = req.body;

    if (paymentData.paymentMethod) {
      const validation = validatePaymentMethod(paymentData.paymentMethod, paymentData);
      if (!validation.valid) {
        return res.status(400).json({ success: false, message: validation.error });
      }
    }

    const emi = await updateEmiPaymentService(id, paymentData);
    res.status(200).json({ success: true, message: "EMI payment updated successfully", data: emi });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteEmi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "EMI id is required" });
    await deleteEmiService(id);
    res.status(200).json({ success: true, message: "EMI record deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
