import Department from "../../Models/Core/Department.ts";

export const createDepartmentService = async (dData: {
  name: string;
  code: string;
  estdYear?: string;
  designations?: string[] | string;
}) => {
  const deptCode = await Department.findOne({ code: dData.code });

  if (deptCode) {
    throw new Error("Department already exists");
  }

  const cleanDesignations = Array.isArray(dData.designations)
    ? dData.designations.filter((item) => typeof item === "string" && item.trim().length > 0)
    : typeof dData.designations === "string"
    ? dData.designations
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    : [];

  return Department.create({
    ...dData,
    designations: cleanDesignations,
  });
};

export const findDepartmentByIdService = async (id: string) => {
  return Department.findById(id);
};

export const getAllDepartmentService = async (filter?: { department?: string }) => {
  const query = filter?.department ? { _id: filter.department } : {};
  return Department.find(query);
};

export const updateDepartmentService = async (
  id: string,
  data: { name?: string; code?: string; estdYear?: string; designations?: string[] | string }
) => {
  const updatedData = { ...data };

  if (Array.isArray(data.designations)) {
    updatedData.designations = data.designations.filter(
      (item) => typeof item === "string" && item.trim().length > 0
    );
  } else if (typeof data.designations === "string") {
    updatedData.designations = data.designations
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  const department = await Department.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });
  if (!department) {
    throw new Error("Department not found");
  }
  return department;
};

export const deleteDepartmentService = async (id: string) => {
  return Department.findByIdAndDelete(id);
};
