import Fee from "../../Models/Finance/Fee.ts";
import type { IFee } from "../../Interfaces/Finance/Fee.ts";

export interface ICreateFeeInput {
  student: string;
  feeType?: string;
  amount: number;
  discountAmount?: number;
  fineAmount?: number;
  netAmount?: number;
  semester?: number;
  paymentDate?: Date | string;
  dueDate?: Date | string;
  paymentMethod?: string;
  transactionId?: string;
  receiptNumber?: string;
  status?: string;
  remarks?: string;
  source?: string;
  admissionId?: string;
  emiId?: string;
}

const computeNetAmount = (data: Pick<ICreateFeeInput, "amount" | "discountAmount" | "fineAmount" | "netAmount">) =>
  data.netAmount ?? Math.max(
    (data.amount || 0) - (data.discountAmount || 0) + (data.fineAmount || 0),
    0
  );

const buildReceiptNumber = (prefix = "REC") =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const createFeeRecordService = async (data: ICreateFeeInput) => {
  const receiptNumber = data.receiptNumber || buildReceiptNumber();
  const netAmount = computeNetAmount(data);
  return Fee.create({ ...(data as any), receiptNumber, netAmount });
};

export const upsertFeeRecordService = async (
  filter: Record<string, unknown>,
  data: ICreateFeeInput
) => {
  const existing = await Fee.findOne(filter).select("receiptNumber");
  const receiptNumber = data.receiptNumber || existing?.receiptNumber || buildReceiptNumber(data.source || "REC");
  const netAmount = computeNetAmount(data);

  return Fee.findOneAndUpdate(
    filter,
    { ...(data as any), receiptNumber, netAmount },
    {
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    }
  );
};

export const searchFeesService = async (filter: {
  studentId?: string;
  status?: string;
  semester?: string;
  dateFrom?: string;
  dateTo?: string;
  keyword?: string;
  feeType?: string;
  paymentMethod?: string;
  source?: string;
  size?: number;
  page?: number;
}) => {
  const query: Record<string, unknown> = {};

  if (filter.studentId) query.student = filter.studentId;
  if (filter.status) query.status = filter.status;
  if (filter.semester) query.semester = parseInt(filter.semester);
  if (filter.feeType) query.feeType = filter.feeType;
  if (filter.paymentMethod) query.paymentMethod = filter.paymentMethod;
  if (filter.source) query.source = filter.source;

  if (filter.dateFrom || filter.dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (filter.dateFrom) dateFilter.$gte = new Date(filter.dateFrom);
    if (filter.dateTo) dateFilter.$lte = new Date(filter.dateTo);
    query.paymentDate = dateFilter;
  }

  if (filter.keyword) {
    query.$or = [
      { receiptNumber: { $regex: filter.keyword, $options: "i" } },
      { transactionId: { $regex: filter.keyword, $options: "i" } },
      { remarks: { $regex: filter.keyword, $options: "i" } },
      { feeType: { $regex: filter.keyword, $options: "i" } },
    ];
  }

  const page = filter.page || 1;
  const size = filter.size || 50;
  const skip = (page - 1) * size;

  const [records, total] = await Promise.all([
    Fee.find(query)
      .populate({
        path: "student",
        select: "firstName lastName enrollmentNumber email phone",
        populate: [
          { path: "department", select: "name code" },
          { path: "course", select: "name code" },
          { path: "section", select: "name code" },
          { path: "academicYear", select: "name code" },
        ],
      })
      .populate("admissionId", "admissionNumber billNumber paymentPlan totalFeeAmount discountAmount netPayableAmount amountPaid balanceDue")
      .populate("emiId", "emiNumber emiAmount dueDate paidAmount fineAmount carryOverAmount status")
      .sort({ paymentDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(size),
    Fee.countDocuments(query),
  ]);

  return { content: records, total, page, size, totalPages: Math.ceil(total / size) };
};

export const getFeeByIdService = async (id: string) => {
  return Fee.findById(id).populate({
    path: "student",
    select: "firstName lastName enrollmentNumber email phone",
    populate: [
      { path: "department", select: "name code" },
      { path: "course", select: "name code" },
      { path: "section", select: "name code" },
      { path: "academicYear", select: "name code" },
    ],
  })
    .populate("admissionId", "admissionNumber billNumber paymentPlan totalFeeAmount discountAmount netPayableAmount amountPaid balanceDue")
    .populate("emiId", "emiNumber emiAmount dueDate paidAmount fineAmount carryOverAmount status");
};

export const getTotalCollectedService = async () => {
  const result = await Fee.aggregate([
    { $match: { status: { $in: ["PAID", "PARTIAL"] } } },
    {
      $group: {
        _id: null,
        totalCollected: { $sum: "$netAmount" },
        totalDiscount: { $sum: "$discountAmount" },
        totalFines: { $sum: "$fineAmount" },
      },
    },
  ]);

  return {
    totalCollected: result[0]?.totalCollected || 0,
    totalDiscount: result[0]?.totalDiscount || 0,
    totalFines: result[0]?.totalFines || 0,
    netCollected: (result[0]?.totalCollected || 0) - (result[0]?.totalDiscount || 0) + (result[0]?.totalFines || 0),
  };
};

export const updateFeeStatusService = async (id: string, status: string) => {
  return Fee.findByIdAndUpdate(id, { status }, { new: true });
};

export const deleteFeeService = async (id: string) => {
  const fee = await Fee.findByIdAndDelete(id);
  if (!fee) throw new Error("Fee record not found");
  return fee;
};
