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

      const analysis = await step.run("analyze-message", async () => {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const prompt = `Analyze this therapy message: ${message}`;
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text().trim();
          return JSON.parse(text);
        } catch {
          return {
            emotionalState: "neutral",
            themes: [],
            riskLevel: 0,
            recommendedApproach: "supportive",
            progressIndicators: [],
          };
        }
      });

      const updatedMemory = await step.run("update-memory", async () => {
        if (analysis.emotionalState) {
          memory.userProfile = memory.userProfile || {};
          memory.userProfile.emotionalState = [
            ...(memory.userProfile.emotionalState || []),
            analysis.emotionalState,
          ];
        }
        if (analysis.themes) {
          memory.sessionContext = memory.sessionContext || {};
          memory.sessionContext.conversationThemes = [
            ...(memory.sessionContext.conversationThemes || []),
            ...analysis.themes,
          ];
        }
        if (analysis.riskLevel) {
          memory.userProfile.riskLevel = analysis.riskLevel;
        }
        return memory;
      });

      if (analysis.riskLevel > 4) {
        await step.run("trigger-risk-alert", async () => {
          logger.warn("High risk level detected in chat message", {
            message,
            riskLevel: analysis.riskLevel,
          });
        });
      }

      const response = await step.run("generate-response", async () => {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const prompt = `${systemPrompt}\nMessage: ${message}\nAnalysis: ${JSON.stringify(
            analysis
          )}`;
          const result = await model.generateContent(prompt);
          return result.response.text().trim();
        } catch {
          return "I'm here to support you. Could you tell me more about what's on your mind?";
        }
      });

      return { response, analysis, updatedMemory };
    } catch (error) {
      logger.error("Error in chat message processing:", error);
      return { response: "Default fallback", analysis: {}, updatedMemory: {} };
    }
  }
);

export const analyzeTherapySession = inngest.createFunction(
  { id: "analyze-therapy-session" },
  { event: "therapy/session.created" },
  async ({ event, step }) => {
    try {
      const sessionContent = await step.run("get-session-content", async () => {
        return event.data.notes || event.data.transcript;
      });

      const analysis = await step.run("analyze-with-gemini", async () => {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Analyze session: ${sessionContent}`;
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
      });

      return { message: "Session analysis completed", analysis };
    } catch (error) {
      logger.error("Error in therapy session analysis:", error);
      throw error;
    }
  }
);

export const generateActivityRecommendations = inngest.createFunction(
  { id: "generate-activity-recommendations" },
  { event: "mood/updated" },
  async ({ event, step }) => {
    try {
      const userContext = await step.run("get-user-context", async () => {
        return {
          recentMoods: event.data.recentMoods,
          completedActivities: event.data.completedActivities,
          preferences: event.data.preferences,
        };
      });

      const recommendations = await step.run(
        "generate-recommendations",
        async () => {
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const prompt = `Generate activity recommendations: ${JSON.stringify(
            userContext
          )}`;
          const result = await model.generateContent(prompt);
          return JSON.parse(result.response.text());
        }
      );

      return { message: "Activity recommendations generated", recommendations };
    } catch (error) {
      logger.error("Error generating activity recommendations:", error);
      throw error;
    }
  }
);

export const functions = [
  processChatMessage,
  analyzeTherapySession,
  generateActivityRecommendations,
];

