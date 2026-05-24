import { Document } from "mongoose";

export interface IAcademicYear extends Document {
    name:string;
    startDate:Date;
    endDate:Date;
    isActive:boolean;
}