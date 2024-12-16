import { Keypair, Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

export class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  }

  createAccount(): { publicKey: string; secretKey: string } {
    const keypair = Keypair.generate();
    return {
      publicKey: keypair.publicKey.toString(),
      secretKey: bs58.encode(keypair.secretKey)
    };
  }

  async sendTransaction(
    fromSecretKey: string,
    toAddress: string,
    amount: number
  ): Promise<string> {
    try {
      const fromKeypair = Keypair.fromSecretKey(bs58.decode(fromSecretKey));
      const toPublicKey = new PublicKey(toAddress);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports: amount * LAMPORTS_PER_SOL
        })
      );

      const signature = await this.connection.sendTransaction(transaction, [fromKeypair]);
      await this.connection.confirmTransaction(signature);
      
      return signature;
    } catch (error) {
      throw new Error(`Failed to send transaction: ${error}`);
    }
  }
}