import mongoose ,{Schema,Model}from "mongoose";
import type { Idepartment } from "../../Interfaces/Core/Department.ts";


const departmentSchema = new Schema<Idepartment> (
    {
        name:{
            type:String,
            required:true,
        },
        code:{
            type:String,
            required:true,
            unique:true,
        },
        estdYear:{
            type:String
        }
    }
);

const Department:Model<Idepartment>= mongoose.model<Idepartment>("Department",departmentSchema);
export default Department;