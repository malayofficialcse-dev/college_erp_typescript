import { Document } from "mongoose";

interface Idepartment extends Document{
    name:string;
    code:string;
    estdYear?:string;
};

export type {Idepartment};