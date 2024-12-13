import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

export function createBot() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is not defined");
  }

  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  // Basic commands
  bot.command("start", (ctx) => {
    ctx.reply("Welcome! Use /help to see available commands.");
  });

  bot.command("help", (ctx) => {
    const helpMessage = `
Available commands:
/hello - Get a friendly greeting
/high - Get a fun high-five response
/help - Show this help message
    `;
    ctx.reply(helpMessage);
  });

  bot.command("hello", (ctx) => {
    ctx.reply(`Hello there, ${ctx.from?.first_name || "friend"}! 👋`);
  });

  bot.command("/high", (ctx) => {
    ctx.reply("🖐️ High five! ✋ You rock!");
  });

  // Handle unknown commands
  bot.on("text", (ctx) => {
    if (!ctx.message.text.startsWith("/")) {
      ctx.reply(
        "I don't understand that command. Try /help to see available commands."
      );
    }
  });

  return bot;
}
