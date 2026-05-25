import mongoose ,{Document,Types} from "mongoose";

export interface ISubject extends Document {
    subjectCode:string;
    subjectName:string;
    department:Types.ObjectId;
    course:Types.ObjectId;
    semester: Types.ObjectId;
    credits:number;
    subjectType:'Theory' | 'Practical' | 'Lab';
    totalMarks:number;
    passingMarks:number;
}