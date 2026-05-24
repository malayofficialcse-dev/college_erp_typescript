import mongoose,{Schema,Model} from "mongoose";
import type ICourse  from "../../Interfaces/Core/Courses.ts";

const courseSchema = new Schema<ICourse>(
    {
        name:{
            type:String,
            required:true,
            trim:true,
        },
        code:{
            type:String,
            required:true,
            unique:true,
            uppercase:true,
            trim:true,
        },
        duration:{
            type:String,
            required:true,
        },
        fees:{
            type:Number,
            required:true,
        },
        department:{
            type:Schema.Types.ObjectId,
            ref:"Department",
            required:true,
        },
        description:{
            type:String,
        },
        isActive:{
            type:Boolean,
            default:true
        },
    },
);

const Course :Model<ICourse> = mongoose.model("Course",courseSchema);
export default Course;