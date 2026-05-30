import "dotenv/config";
import app from "./app.ts";
import connectDB from "./config/db.config.ts";

const PORT = Number(process.env.PORT ?? 5001);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
