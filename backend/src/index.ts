const express = require('express');
import{Request , Response} from "express";
import { serve } from "inngest/express";
import { inngest } from "./inngest";
import { functions as inngestFunctions } from "./inngest/functions";
import { logger } from "./utils/logger";
import { connectDB } from "./utils/DB";

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(
  "/api/inngest",
  serve({ client: inngest, functions: inngestFunctions })
);
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the backend!');
});

app.get('/api/chat', (req: Request, res: Response) => {
  res.send('How may I assist you today?');
});
// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Then start the server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(
        `Inngest endpoint available at http://localhost:${PORT}/api/inngest`
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();