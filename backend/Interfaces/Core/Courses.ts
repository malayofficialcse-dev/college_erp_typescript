import { Document,Types } from "mongoose";

export default interface ICourse extends Document{
    name:string;
    department: Types.ObjectId;
    fees:number;
    code:string;
    duration:string,
    description?:string;
    isActive:boolean;
}

