import { Connection, PublicKey } from '@solana/web3.js';

export interface SolanaAccount {
  publicKey: string;
  privateKey: string;
}

export interface TransactionResult {
  signature: string;
  status: 'success' | 'error';
  message?: string;
}

export interface WalletBalance {
  publicKey: string;
  balance: number;
}

export interface DatabaseConfig {
  uri: string;
}

export interface BotConfig {
  token: string;
}

export interface SolanaConfig {
  connection: Connection;
  endpoint: string;
}

export interface AppConfig {
  database: DatabaseConfig;
  bot: BotConfig;
  solana: SolanaConfig;
}