const express = require('express');
import{Request , Response} from "express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest";

const app = express();
const PORT = 3001;

app.use(express.json());
app.use("/api/inngest", serve({ client: inngest, functions }));
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the backend!');
});

app.get('/api/chat', (req: Request, res: Response) => {
  res.send('How may I assist you today?');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});