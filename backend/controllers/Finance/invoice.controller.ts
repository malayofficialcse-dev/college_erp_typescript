import type { Request, Response } from "express";
import FeeInvoice from "../../Models/Finance/FeeInvoice.ts";
import InvoicePayment from "../../Models/Finance/InvoicePayment.ts";
import Student from "../../Models/Core/Student.ts";
import { createFeeRecordService } from "../../Services/Core/Fee.service.ts";

const getInvoiceStatus = (totalAmount: number, paidAmount: number) => {
  if (paidAmount <= 0) return "UNPAID";
  if (paidAmount >= totalAmount) return "PAID";
  return "PARTIAL";
};

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const { status, keyword, department } = req.query as Record<string, string>;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (department) {
      const students = await Student.find({ department }).select("_id");
      query.student = { $in: students.map((student) => student._id) };
    }
    if (keyword) {
      query.$or = [
        { invoiceNumber: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { remarks: { $regex: keyword, $options: "i" } },
      ];
    }

    const invoices = await FeeInvoice.find(query)
      .populate({
        path: "student",
        select: "firstName lastName enrollmentNumber email",
        populate: { path: "department", select: "name code" },
      })
      .sort({ dueDate: 1, createdAt: -1 });

    res.status(200).json({ success: true, data: invoices });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await FeeInvoice.create({
      invoiceNumber: req.body.invoiceNumber || `INV-${Date.now()}`,
      student: req.body.student,
      dueDate: req.body.dueDate,
      totalAmount: Number(req.body.totalAmount || 0),
      paidAmount: Number(req.body.paidAmount || 0),
      status: getInvoiceStatus(Number(req.body.totalAmount || 0), Number(req.body.paidAmount || 0)),
      description: req.body.description,
      remarks: req.body.remarks,
    });

    res.status(201).json({ success: true, message: "Invoice created", data: invoice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordInvoicePayment = async (req: Request, res: Response) => {
  try {
    const invoice = await FeeInvoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const amount = Number(req.body.amount || 0);
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "Payment amount must be greater than zero" });
    }

    const payment = await InvoicePayment.create({
      invoice: invoice._id,
      amount,
      paymentDate: req.body.paymentDate || new Date(),
      paymentMethod: req.body.paymentMethod || "CASH",
      referenceNumber: req.body.referenceNumber,
      remarks: req.body.remarks,
    });

    const paidAmount = Math.min(Number(invoice.paidAmount || 0) + amount, Number(invoice.totalAmount || 0));
    invoice.paidAmount = paidAmount;
    invoice.status = getInvoiceStatus(Number(invoice.totalAmount || 0), paidAmount);
    await invoice.save();

    await createFeeRecordService({
      student: invoice.student.toString(),
      feeType: `Invoice ${invoice.invoiceNumber}`,
      amount,
      discountAmount: 0,
      fineAmount: 0,
      paymentDate: payment.paymentDate,
      dueDate: invoice.dueDate,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.referenceNumber,
      status: "PAID",
      source: "INVOICE",
      remarks: `[INVOICE] ${invoice.invoiceNumber}${payment.remarks ? ` - ${payment.remarks}` : ""}`,
    });

    res.status(201).json({ success: true, message: "Invoice payment recorded", data: payment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
