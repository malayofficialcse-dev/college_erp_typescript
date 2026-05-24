import mongoose,{Schema,model} from "mongoose";
import type { IAcademicYear } from "../../Interfaces/Core/AcademicYear.js";

const academicsYearSchema = new Schema<IAcademicYear> (
    {
        name:{
            type:String,
            required:true,
            unique:true,
            trim:true
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
            default:false,
        },
    },{timestamps:true}
);

export default mongoose.model<IAcademicYear> (
    'AcademicYear',
    academicsYearSchema
);