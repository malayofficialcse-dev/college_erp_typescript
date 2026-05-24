import { Document, Types } from "mongoose";

export interface ISemester extends Document {
    name:string;
    semesterNumber:number;
    academicYear:Types.ObjectId;
    startDate:Date;
    endDate:Date;
    isActive:boolean;
};