import { PrismaClient } from '@prisma/client';
import { SolanaService } from './solana.service';

const prisma = new PrismaClient();
const solanaService = new SolanaService();

export class UserService {
  async createUser(telegramId: string) {
    const existingUser = await prisma.user.findUnique({
      where: { telegramId }
    });

    if (existingUser) {
      return existingUser;
    }

    const { publicKey, secretKey } = solanaService.createAccount();

    return prisma.user.create({
      data: {
        telegramId,
        walletAddress: publicKey,
        secretKey
      }
    });
  }

  async getUser(telegramId: string) {
    return prisma.user.findUnique({
      where: { telegramId }
    });
  }
}