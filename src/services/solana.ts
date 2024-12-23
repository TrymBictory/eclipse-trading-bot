import { Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';
import { SolanaAccount, TransactionResult, WalletBalance, SolanaConfig } from '../types';

export class SolanaService {
  private config: SolanaConfig;

  constructor(config: SolanaConfig) {
    this.config = config;
  }

  createAccount(): SolanaAccount {
    const keypair = Keypair.generate();
    return {
      publicKey: keypair.publicKey.toString(),
      privateKey: bs58.encode(keypair.secretKey)
    };
  }

  async getBalance(publicKey: string): Promise<WalletBalance> {
    const balance = await this.config.connection.getBalance(new PublicKey(publicKey));
    return {
      publicKey,
      balance: balance / LAMPORTS_PER_SOL
    };
  }

  async sendTransaction(
    fromPrivateKey: string,
    toAddress: string,
    amount: number
  ): Promise<TransactionResult> {
    try {
      const fromKeypair = Keypair.fromSecretKey(bs58.decode(fromPrivateKey));
      const toPublicKey = new PublicKey(toAddress);
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports: amount * LAMPORTS_PER_SOL
        })
      );

      const signature = await this.config.connection.sendTransaction(
        transaction,
        [fromKeypair]
      );

      return {
        signature,
        status: 'success'
      };
    } catch (error) {
      return {
        signature: '',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}