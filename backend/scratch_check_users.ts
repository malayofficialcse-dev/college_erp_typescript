import mongoose from "mongoose";
import dotenv from "dotenv";
import UserAccount from "./Models/Auth/UserAccount.ts";
import Employee from "./Models/HR/Employee.ts";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/college_erp";

async function run() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");
  
  const users = await UserAccount.find();
  console.log("ALL USER ACCOUNTS:");
  for (const u of users) {
    console.log(`Username: ${u.username}`);
    console.log(`  Roles: ${u.roles.join(', ')}`);
    console.log(`  Employee ObjectId: ${u.employee || 'NONE'}`);
    console.log(`  Student ObjectId: ${u.student || 'NONE'}`);
    if (u.employee) {
      const emp = await Employee.findById(u.employee);
      console.log(`    Employee Name: ${emp ? emp.firstName + ' ' + emp.lastName : 'NOT FOUND'}`);
      console.log(`    Employee Dept: ${emp ? emp.department : 'N/A'}`);
    }
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
