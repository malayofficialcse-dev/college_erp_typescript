import mongoose,{Schema} from "mongoose";
import { ISubject } from "../../Interfaces/Core/Subject.ts";

const subjectSchema = new Schema<ISubject> (
    {
        subjectCode:{
            type:String,
            required:true,
            unique:true,
            trim:true,
        },
        subjectName:{
            type:String,
            reuqired:true,
            trim:true,
        },
        department:{
            type:Schema.Types.ObjectId,
            ref:'Course',
            required:true,
        },
        semester:{
            type:Schema.Types.ObjectId,
            ref:'Semester',
            required:true,
        },
        credits:{
            type:Number,
            default:0,
        },
        subjectType:{
            type:String,
            enum:['Theory','Practical','Lab'],
            default:'Theory',
        },
        totalMarks:{
            type:Number,
            default:100,
        },
        passingMarks:{
            type:Number,
            default:40,
        },
    },{timestamps:true}
);

export default mongoose.model<ISubject>('Subject',subjectSchema);