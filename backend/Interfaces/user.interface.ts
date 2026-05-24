import {Document} from "mongoose";

interface IAddress {
    city:string;
    state:string;
    country:string;
    village?:string;
    landmark?:string;
};

interface IUser extends Document {
    name:string;
    address:IAddress;
    email:string;
    password:string;
    phone:string;

    comparePassword(candidatePassword:string):Promise<boolean>;
};

export type {IAddress,IUser};