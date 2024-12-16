import dotenv from 'dotenv';
dotenv.config();

export const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN!,
  databaseUrl: process.env.DATABASE_URL!
};