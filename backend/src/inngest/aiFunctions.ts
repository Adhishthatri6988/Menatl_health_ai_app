import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger";

// Initialize Gemini (use environment variable, no fallback key in code)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
