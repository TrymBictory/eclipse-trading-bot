import express from "express";
import { createBot } from "./bot";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const bot = createBot();

// For local development, use polling instead of webhooks
bot.launch();

// Optional: Add a simple express route
app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
