import { Telegraf, Context } from 'telegraf';
import { Account } from '../../models/Account';
import { SolanaService } from '../../services/solana';

export class BotCommands {
  private bot: Telegraf;
  private solanaService: SolanaService;

  constructor(bot: Telegraf, solanaService: SolanaService) {
    this.bot = bot;
    this.solanaService = solanaService;
    this.setupCommands();
  }

  private setupCommands(): void {
    this.bot.command('start', this.handleStart);
    this.bot.command('createwallet', this.handleCreateWallet);
    this.bot.command('balance', this.handleBalance);
    this.bot.command('send', this.handleSend);
  }

  private handleStart = (ctx: Context): void => {
    ctx.reply(
      'Welcome to Solana Wallet Bot! 🚀\n\n' +
      'Available commands:\n' +
      '/createwallet - Create a new Solana wallet\n' +
      '/balance - Check your wallet balance\n' +
      '/send <address> <amount> - Send SOL to an address'
    );
  };

  private handleCreateWallet = async (ctx: Context): Promise<void> => {
    try {
      if (!ctx.from?.id) {
        throw new Error('User ID not found');
      }

      const userId = ctx.from.id.toString();
      const existingAccount = await Account.findOne({ userId });

      if (existingAccount) {
        await ctx.reply('You already have a wallet! Use /balance to check your balance.');
        return;
      }

      const { publicKey, privateKey } = this.solanaService.createAccount();
      
      await Account.create({
        userId,
        publicKey,
        privateKey
      });

      await ctx.reply(
        `✅ Wallet created successfully!\n\nYour public key: ${publicKey}\n\nKeep this safe!`
      );
    } catch (error) {
      await ctx.reply('❌ Error creating wallet. Please try again.');
      console.error(error);
    }
  };

  private handleBalance = async (ctx: Context): Promise<void> => {
    try {
      if (!ctx.from?.id) {
        throw new Error('User ID not found');
      }

      const userId = ctx.from.id.toString();
      const account = await Account.findOne({ userId });
      
      if (!account) {
        await ctx.reply('You don\'t have a wallet yet! Use /createwallet to create one.');
        return;
      }

      const { balance } = await this.solanaService.getBalance(account.publicKey);
      await ctx.reply(`💰 Your balance: ${balance} SOL`);
    } catch (error) {
      await ctx.reply('❌ Error checking balance. Please try again.');
      console.error(error);
    }
  };

  private handleSend = async (ctx: Context): Promise<void> => {
    try {
      if (!ctx.from?.id || !ctx.message || !('text' in ctx.message)) {
        throw new Error('Invalid context');
      }

      const userId = ctx.from.id.toString();
      const [, toAddress, amount] = ctx.message.text.split(' ');
      
      if (!toAddress || !amount) {
        await ctx.reply('❌ Please use the format: /send <address> <amount>');
        return;
      }

      const account = await Account.findOne({ userId });
      if (!account) {
        await ctx.reply('You don\'t have a wallet yet! Use /createwallet to create one.');
        return;
      }

      const result = await this.solanaService.sendTransaction(
        account.privateKey,
        toAddress,
        parseFloat(amount)
      );

      if (result.status === 'success') {
        await ctx.reply(`✅ Transaction successful!\nSignature: ${result.signature}`);
      } else {
        await ctx.reply(`❌ Transaction failed: ${result.message}`);
      }
    } catch (error) {
      await ctx.reply('❌ Transaction failed. Please try again.');
      console.error(error);
    }
  };
}