import express from 'express';
import { TelegramBotService } from './bot';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const bot = new TelegramBotService();

app.use(express.json());

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected to database');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Telegram bot is active');
    });
  } catch (error) {
    console.error('Failed to start the application:', error);
    process.exit(1);
  }
}

main();