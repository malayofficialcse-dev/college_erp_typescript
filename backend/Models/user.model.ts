import mongoose,{Schema,Model} from "mongoose";
import bcrypt from "bcrypt";
import type {IUser,IAddress} from "../Interfaces/user.interface.ts";

const addressSchema = new Schema<IAddress> (
    {
        city:{
            type:String,
            required:true,
        },
        state:{
            type:String,
        },
        village:{
            type:String,
        },
        landmark:{
            type:String
        }
    }
);

const userSchema = new Schema<IUser> (
    {
        name :{
            type:String,
            required:true,
        },
        address :{
            type:addressSchema,
            required:true,
        },
        email :{
            type:String,
            required:true,
            unique:true,
        },
        password:{
            type:String,
            required:true,
            select:false,
        },
        phone: {
            type:String,
            required:true,
        },
    },{timestamps:true}
);

const User:Model<IUser> = mongoose.model<IUser>("User",userSchema);
export default User;