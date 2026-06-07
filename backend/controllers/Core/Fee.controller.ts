import type { Request, Response } from "express";
import {
  createFeeRecordService,
  searchFeesService,
  getFeeByIdService,
  getTotalCollectedService,
  updateFeeStatusService,
  deleteFeeService,
} from "../../Services/Core/Fee.service.ts";

const getId = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const createFeeRecord = async (req: Request, res: Response) => {
  try {
    const fee = await createFeeRecordService(req.body);
    res.status(201).json({ success: true, message: "Fee record created", data: fee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchFees = async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      status,
      semester,
      dateFrom,
      dateTo,
      keyword,
      feeType,
      paymentMethod,
      source,
      department,
      size,
      page,
    } = req.query as Record<string, string>;

    const result = await searchFeesService({
      studentId,
      status,
      semester,
      dateFrom,
      dateTo,
      keyword,
      feeType,
      paymentMethod,
      source,
      department,
      size: size ? parseInt(size) : 50,
      page: page ? parseInt(page) : 1,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeeById = async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Fee id is required" });
    const fee = await getFeeByIdService(id);
    if (!fee) return res.status(404).json({ success: false, message: "Fee record not found" });
    res.status(200).json({ success: true, data: fee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTotalCollected = async (_req: Request, res: Response) => {
  try {
    const stats = await getTotalCollectedService();
    res.status(200).json({ success: true, ...stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFeeStatus = async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    const { status } = req.body;
    if (!id) return res.status(400).json({ success: false, message: "Fee id is required" });
    const fee = await updateFeeStatusService(id, status);
    res.status(200).json({ success: true, data: fee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFee = async (req: Request, res: Response) => {
  try {
    const id = getId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Fee id is required" });
    await deleteFeeService(id);
    res.status(200).json({ success: true, message: "Fee record deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
