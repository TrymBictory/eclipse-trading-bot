import { Connection } from '@solana/web3.js';
import dotenv from 'dotenv';
import { AppConfig } from '../types';

dotenv.config();

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN must be provided');
}

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI must be provided');
}

const SOLANA_ENDPOINT = 'https://api.devnet.solana.com';

export const config: AppConfig = {
  database: {
    uri: process.env.MONGODB_URI
  },
  bot: {
    token: process.env.TELEGRAM_BOT_TOKEN
  },
  solana: {
    connection: new Connection(SOLANA_ENDPOINT, 'confirmed'),
    endpoint: SOLANA_ENDPOINT
  }
};