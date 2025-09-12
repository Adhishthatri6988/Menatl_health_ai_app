import { Request, Response } from "express";
import { ChatSession, IChatSession } from "../models/ChatSession";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";
import { inngest } from "../inngest/client";
import { User } from "../models/User";
import { InngestSessionResponse, InngestEvent } from "../types/inngest";
import { Types } from "mongoose";

// Initialize Gemini API securely
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  logger.error("GEMINI_API_KEY is not set in environment variables.");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);

// Create a new chat session
export const createChatSession = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized - User not authenticated" });
    }
    const userId = new Types.ObjectId(req.user.id);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const sessionId = uuidv4();
    const session = new ChatSession({
      sessionId,
      userId,
      startTime: new Date(),
      status: "active",
      messages: [],
    });
    await session.save();
    res.status(201).json({
      message: "Chat session created successfully",
      sessionId: session.sessionId,
    });
  } catch (error) {
    logger.error("Error creating chat session:", error);
    res.status(500).json({
      message: "Error creating chat session",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Send a message in the chat session
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    const userId = new Types.ObjectId(req.user.id);

    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const event: InngestEvent = {
      name: "therapy/session.message",
      data: {
        message,
        history: session.messages,
        memory: { /* ... memory object ... */ },
        goals: [],
        systemPrompt: `You are an AI therapist assistant...`,
      },
    };
    await inngest.send(event);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const analysisPrompt = `Analyze...`; // (Omitted for brevity)
    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisText = analysisResult.response.text().trim();
    const cleanAnalysisText = analysisText.replace(/```json\n|\n```/g, "").trim();
    const analysis = JSON.parse(cleanAnalysisText);
    logger.info("Message analysis:", analysis);

    // Generate therapeutic response
    const responsePrompt = `${event.data.systemPrompt}
   
    Based on the following context, generate a therapeutic response:
    Message: ${message}
    Analysis: ${JSON.stringify(analysis)}
    Memory: ${JSON.stringify(event.data.memory)}
    Goals: ${JSON.stringify(event.data.goals)}
   
    Provide a response that:
    1. Addresses the immediate emotional needs
    2. Uses appropriate therapeutic techniques
    3. Shows empathy and understanding
    4. Maintains professional boundaries
    5. Considers safety and well-being`;
    const responseResult = await model.generateContent(responsePrompt);
    const response = responseResult.response.text().trim();
    logger.info("Generated response:", response);

    // Add message to session history
    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });
    session.messages.push({
      role: "assistant",
      content: response,
      timestamp: new Date(),
      metadata: {
        analysis,
        progress: {
          emotionalState: analysis.emotionalState,
          riskLevel: analysis.riskLevel,
        },
      },
    });

    await session.save();
    logger.info("Session updated successfully:", { sessionId });

    res.json({
      response,
      message: response,
      analysis,
      metadata: { /* ... metadata ... */ },
    });
  } catch (error) {
    logger.error("Error in sendMessage:", error);
    res.status(500).json({
      message: "Error processing message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};