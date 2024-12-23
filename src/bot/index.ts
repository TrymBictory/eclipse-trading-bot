import { Telegraf } from 'telegraf';
import { BotCommands } from './commands';
import { SolanaService } from '../services/solana';
import { BotConfig } from '../types';

export class Bot {
  private bot: Telegraf;
  private commands: BotCommands;

  constructor(config: BotConfig, solanaService: SolanaService) {
    this.bot = new Telegraf(config.token);
    this.commands = new BotCommands(this.bot, solanaService);
  }

  async start(): Promise<void> {
    await this.bot.launch();
    console.log('Bot started successfully');

    // Enable graceful stop
    process.once('SIGINT', () => this.stop());
    process.once('SIGTERM', () => this.stop());
  }

  async stop(): Promise<void> {
    await this.bot.stop();
  }
}