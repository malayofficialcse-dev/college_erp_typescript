import express from "express";
import {
  createInvoice,
  getInvoices,
  recordInvoicePayment,
} from "../../controllers/Finance/invoice.controller.ts";

const router = express.Router();

router.get("/", getInvoices);
router.post("/", createInvoice);
router.post("/:id/payments", recordInvoicePayment);

export default router;
