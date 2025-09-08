import mongoose from "mongoose";
import { logger } from "./logger";

const MONGODB_URI =process.env.MONGODB_URI || "mongodb+srv://asunasingh2003_db_user:3e2ZnPJG4t4rb39i@ai-therapist-app.0mbf24u.mongodb.net/?retryWrites=true&w=majority&appName=ai-therapist-app" ;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info("Connected to MongoDB Atlas");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};