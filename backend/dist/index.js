"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const app = express();
const PORT = 3001;
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});
app.get('/api/chat', (req, res) => {
    res.send('How may I assist you today?');
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
