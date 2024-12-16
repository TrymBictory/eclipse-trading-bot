import TelegramBot from "node-telegram-bot-api";
import { config } from "../config";
import { UserService } from "../services/user.service";
import { SolanaService } from "../services/solana.service";

const userService = new UserService();
const solanaService = new SolanaService();

export class TelegramBotService {
  private bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot(config.telegramToken, { polling: true });
    this.setupCommands();
  }

  private setupCommands() {
    this.bot.onText(/\/start/, this.handleStart.bind(this));
    this.bot.onText(/\/createwallet/, this.handleCreateWallet.bind(this));
    this.bot.onText(/\/send (.+)/, this.handleSendTransaction.bind(this));
  }

  private async handleStart(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    await this.bot.sendMessage(
      chatId,
      "Welcome! Use /createwallet to create a Solana wallet or /send <address> <amount> to send SOL"
    );
  }

  private async handleCreateWallet(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    try {
      const user = await userService.createUser(chatId.toString());
      await this.bot.sendMessage(
        chatId,
        `Wallet created successfully!\nYour address: ${user.walletAddress}`
      );
    } catch (error) {
      await this.bot.sendMessage(
        chatId,
        "Failed to create wallet. Please try again."
      );
    }
  }

  private async handleSendTransaction(
    msg: TelegramBot.Message,
    match: RegExpExecArray | null
  ) {
    const chatId = msg.chat.id;
    if (!match || !match[1]) {
      await this.bot.sendMessage(
        chatId,
        "Please provide recipient address and amount: /send <address> <amount>"
      );
      return;
    }

    const [address, amount] = match[1].trim().split(" ");
    if (!address || !amount) {
      await this.bot.sendMessage(
        chatId,
        "Invalid format. Use: /send <address> <amount>"
      );
      return;
    }

    try {
      const user = await userService.getUser(chatId.toString());
      if (!user || !user.secretKey) {
        await this.bot.sendMessage(
          chatId,
          "Please create a wallet first using /createwallet"
        );
        return;
      }

      const signature = await solanaService.sendTransaction(
        user.secretKey,
        address,
        parseFloat(amount)
      );

      await this.bot.sendMessage(
        chatId,
        `Transaction sent successfully!\nSignature: ${signature}`
      );
    } catch (error: any) {
      await this.bot.sendMessage(
        chatId,
        `Failed to send transaction: ${error.message}`
      );
    }
  }
}
