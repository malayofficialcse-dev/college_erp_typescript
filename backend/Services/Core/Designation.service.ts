import Designation from "../../Models/Core/Designation.ts";

export const createDesignationService = async (data: {
  title: string;
  code: string;
  description?: string;
  department?: string;
  level?: number;
}) => {
  const existingCode = await Designation.findOne({ code: data.code });
  if (existingCode) {
    throw new Error("Designation with this code already exists");
  }

  return Designation.create(data);
};

export const getDesignationByIdService = async (id: string) => {
  const designation = await Designation.findById(id).populate("department", "name code");
  if (!designation) {
    throw new Error("Designation not found");
  }
  return designation;
};

export const getAllDesignationService = async (filter?: { department?: string, keyword?: string }) => {
  const query: Record<string, any> = {};
  
  if (filter?.department) {
    query.department = filter.department;
  }
  
  if (filter?.keyword) {
    query.$or = [
      { title: { $regex: filter.keyword, $options: "i" } },
      { code: { $regex: filter.keyword, $options: "i" } },
    ];
  }

  return Designation.find(query).populate("department", "name code").sort({ level: 1 });
};

export const updateDesignationService = async (
  id: string,
  data: Partial<{
    title: string;
    code: string;
    description: string;
    department: string;
    level: number;
    isActive: boolean;
  }>
) => {
  if (data.code) {
    const existingCode = await Designation.findOne({ code: data.code, _id: { $ne: id } });
    if (existingCode) {
      throw new Error("Another designation with this code already exists");
    }
  }

  const designation = await Designation.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!designation) {
    throw new Error("Designation not found");
  }
  return designation;
};

export const deleteDesignationService = async (id: string) => {
  return Designation.findByIdAndDelete(id);
};
