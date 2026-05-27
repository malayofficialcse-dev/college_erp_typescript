import Counseling from "../../Models/Core/Counseling.ts";
import type { CounselingStatus } from "../../Interfaces/Core/index.ts";

export interface ICreateCounselingInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender?: "Male" | "Female" | "Other";
  dateOfBirth?: Date;
  previousQualification?: string;
  desiredCourse?: string;
  counselorName?: string;
  remarks?: string;
  status?: CounselingStatus;
}

export const createCounselingService = async (
  data: ICreateCounselingInput
) => {
  return Counseling.create(data);
};

export const getAllCounselingsService = async (filter: {
  status?: string;
  desiredCourse?: string;
}) => {
  const query: Record<string, unknown> = {};
  if (filter.status) query.status = filter.status;
  if (filter.desiredCourse) query.desiredCourse = filter.desiredCourse;

  return Counseling.find(query)
    .populate("desiredCourse", "name code")
    .sort({ createdAt: -1 });
};

export const getCounselingByIdService = async (id: string) => {
  return Counseling.findById(id).populate("desiredCourse", "name code");
};

export const updateCounselingStatusService = async (
  id: string,
  status: CounselingStatus,
  counselorName?: string,
  remarks?: string
) => {
  const counseling = await Counseling.findByIdAndUpdate(
    id,
    {
      status,
      ...(counselorName && { counselorName }),
      ...(remarks && { remarks }),
    },
    { new: true, runValidators: true }
  ).populate("desiredCourse", "name code");
  if (!counseling) throw new Error("Counseling record not found");
  return counseling;
};

export const updateCounselingService = async (
  id: string,
  data: Partial<ICreateCounselingInput>
) => {
  const counseling = await Counseling.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("desiredCourse", "name code");
  if (!counseling) throw new Error("Counseling record not found");
  return counseling;
};

export const deleteCounselingService = async (id: string) => {
  const counseling = await Counseling.findByIdAndDelete(id);
  if (!counseling) throw new Error("Counseling record not found");
  return counseling;
};
