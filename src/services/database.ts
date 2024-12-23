import { Pool, PoolConfig } from "pg";

export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number; // maximum number of clients in the pool
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export class DatabaseService {
  private config: PostgresConfig;
  private pool: Pool | null = null;
  private maxRetries: number = 3;
  private retryDelay: number = 5000; // 5 seconds

  constructor(config: PostgresConfig) {
    this.config = config;
  }

  async connect(retryCount: number = 0): Promise<void> {
    try {
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        max: this.config.max || 20,
        idleTimeoutMillis: this.config.idleTimeoutMillis || 30000,
        connectionTimeoutMillis: this.config.connectionTimeoutMillis || 5000,
      });

      // Test the connection
      const client = await this.pool.connect();
      client.release();
      console.log("PostgreSQL connected successfully");
    } catch (error) {
      console.error("PostgreSQL connection error:", error);

      if (retryCount < this.maxRetries) {
        console.log(
          `Retrying connection in ${
            this.retryDelay / 1000
          } seconds... (Attempt ${retryCount + 1}/${this.maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.connect(retryCount + 1);
      }

      console.error("Failed to connect to PostgreSQL after multiple attempts");
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.end();
        console.log("PostgreSQL disconnected successfully");
      }
    } catch (error) {
      console.error("Error disconnecting from PostgreSQL:", error);
      throw error;
    }
  }

  // Helper method to get the pool
  getPool(): Pool {
    if (!this.pool) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.pool;
  }

  // Example query method
  async query<T>(text: string, params?: any[]): Promise<T[]> {
    const pool = this.getPool();
    const result = await pool.query(text, params);
    return result.rows as T[];
  }
}
