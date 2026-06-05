import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import UserAccount from "../Models/Auth/UserAccount.ts";
import UserPermission from "../Models/Auth/UserPermission.ts";
import { buildDefaultPagePermissions } from "../config/pagePermissions.ts";

const mongoUri =
  process.env.MONGO_URI_ATLAS ??
  process.env.MONGO_URI ??
  "mongodb://localhost:27017/erp";

const seedAdmin = async () => {
  await mongoose.connect(mongoUri);
  console.log(`Connected to ${mongoose.connection.name}`);

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await UserAccount.findOneAndUpdate(
    { username: "admin" },
    {
      username: "admin",
      email: "admin@college.example",
      password: hashedPassword,
      fullName: "System Administrator",
      roles: ["ROLE_ADMIN"],
      enabled: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const permissions = buildDefaultPagePermissions(["ROLE_ADMIN"]);

  for (const perm of permissions) {
    await UserPermission.findOneAndUpdate(
      { user: adminUser._id, moduleName: perm.moduleName },
      { ...perm, user: adminUser._id },
      { upsert: true }
    );
  }

  console.log("Admin user seeded successfully with all permissions.");
  console.log("Username: admin");
  console.log("Password: admin123");
};

seedAdmin()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Admin seed failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  });
