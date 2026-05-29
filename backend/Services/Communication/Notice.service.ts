import Notice from "../../Models/Communication/Notice.ts";

export interface ICreateNoticeInput {
  title: string;
  content: string;
  noticeType?: "GENERAL" | "ACADEMIC" | "EXAM" | "HOLIDAY" | "URGENT";
  targetAudience?: "ALL" | "STUDENTS" | "STAFF" | "TEACHERS";
  department?: string;
  publishDate?: Date;
  expiryDate?: Date;
  isActive?: boolean;
}

export const createNoticeService = async (data: ICreateNoticeInput) => {
  return Notice.create(data);
};

export const getAllNoticesService = async (filter: {
  noticeType?: string;
  targetAudience?: string;
  department?: string;
}) => {
  const query: Record<string, unknown> = { isActive: true };
  if (filter.noticeType) query.noticeType = filter.noticeType;
  if (filter.targetAudience) query.targetAudience = filter.targetAudience;
  if (filter.department) query.department = filter.department;

  return Notice.find(query)
    .populate("department", "name")
    .sort({ publishDate: -1, createdAt: -1 });
};

export const getNoticeByIdService = async (id: string) => {
  return Notice.findById(id).populate("postedBy", "firstName lastName");
};

export const updateNoticeService = async (id: string, data: Partial<ICreateNoticeInput>) => {
  const notice = await Notice.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!notice) throw new Error("Notice not found");
  return notice;
};

export const deleteNoticeService = async (id: string) => {
  const notice = await Notice.findByIdAndDelete(id);
  if (!notice) throw new Error("Notice not found");
  return notice;
};
