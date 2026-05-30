import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI_ATLAS ?? "mongodb://localhost:27017/erp";

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
