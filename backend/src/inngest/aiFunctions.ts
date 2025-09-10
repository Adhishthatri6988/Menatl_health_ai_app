import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const processChatMessage = inngest.createFunction(
  { id: "process-chat-message" },
  { event: "therapy/session.message" },
  async ({ event, step }) => {
    try {
      const { message, history, memory = {}, goals = [], systemPrompt } =
        event.data;

      logger.info("Processing chat message:", {
        message,
        historyLength: history?.length,
      });

      return { response: "", analysis: {}, updatedMemory: memory };
    } catch (error) {
      logger.error("Error in chat message processing:", error);
      return { response: "Default fallback", analysis: {}, updatedMemory: {} };
    }
  }
);
