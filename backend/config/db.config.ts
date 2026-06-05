import mongoose from "mongoose";

const connectDB = async () => {
   const mongoUri = process.env.MONGO_URI_ATLAS ?? "mongodb://localhost:27017/erp";
  // const mongoUri="mongodb+srv://malay_db_user:TavsQA_nJ%2EKi5nF@cluster0.uunjh9u.mongodb.net/erp?retryWrites=true&w=majority";
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
