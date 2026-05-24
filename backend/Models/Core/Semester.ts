import mongoose, { Schema,Types } from "mongoose";
import type { ISemester } from "../../Interfaces/Core/Semester.ts";

const semesterSchema = new Schema<ISemester> (
    {
        name:{
            type:String,
            required:true,
            trim:true,
        },
        semesterNumber:{
            type:Number,
            required:true,
        },
        academicYear:{
            type:Schema.Types.ObjectId,
            ref:'AcademicYear',
            required:true,
        },
        startDate:{
            type:Date,
            required:true,
        },
        endDate:{
            type:Date,
            required:true,
        },
        isActive:{
            type:Boolean,
            default:true,
        }
    },{
        timestamps:true,
    }
);

export default mongoose.model<ISemester>('Semester',semesterSchema);