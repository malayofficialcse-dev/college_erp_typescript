import app from "./app.ts";
import connectDB from "./config/db.config.ts";

const PORT = 5000;

connectDB();

app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`)
});