import Department from "../../Models/Core/Department.ts";

export const createDepartmentService = async (dData: {
  name: string;
  code: string;
  estdYear?: string;
}) => {
  const deptCode = await Department.findOne({ code: dData.code });

  if (deptCode) {
    throw new Error("Department already exists");
  }

  return Department.create(dData);
};

export const findDepartmentByIdService = async (id: string) => {
  return Department.findById(id);
};

export const getAllDepartmentService = async () => {
  return Department.find();
};

export const updateDepartmentService = async (
  id: string,
  data: { name?: string; code?: string; estdYear?: string }
) => {
  const department = await Department.findByIdAndUpdate(id, data, {
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
