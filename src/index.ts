import express from "express";
import { createBot } from "./bot.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const bot = createBot();

// Parse JSON bodies
app.use(express.json());

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Bot is running" });
});

// Development mode (polling)
if (process.env.NODE_ENV === "development") {
  console.log("Starting bot in development mode (polling)");
  bot
    .launch()
    .then(() => {
      console.log("Bot started successfully in polling mode");
    })
    .catch((err) => {
      console.error("Failed to start bot:", err);
    });
}
// Production mode (webhook)
else {
  const webhookPath = `/webhook/${process.env.TELEGRAM_BOT_TOKEN}`;
  app.post(webhookPath, (req, res) => {
    try {
      bot.handleUpdate(req.body, res);
    } catch (error) {
      console.error("Error handling update:", error);
      res.status(500).send("Error handling update");
    }
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Enable graceful stop
process.once("SIGINT", () => {
  console.log("Stopping bot...");
  bot.stop("SIGINT");
});
process.once("SIGTERM", () => {
  console.log("Stopping bot...");
  bot.stop("SIGTERM");
});
