import Department from "../../Models/Core/Department.ts";

export const  createDepartmentService = async (dData:any) => {
    const deptCode = await Department.findOne({
        code:dData.code
    });

    if(deptCode){
        throw new Error ("Department already exists");
    }

    const department = await Department.create(dData);

    return department;
}

export const findDepartmentByIdService = async (id:string) => {
    const department = await Department.findById(id);

    if(!department) {
        throw new Error("Department not found");
    };

    return department;
}

export const getAllDepartmentService = async (dData:any) => {
    const departments = await Department.find();
    return departments;
}

export const deleteDepartmentService = async (id:string) => {
    const dept = await Department.findById(id);

    if(!dept){
        throw new Error("Department not found");
    }

    return await Department.findByIdAndDelete(dept);
}

