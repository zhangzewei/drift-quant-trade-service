// drift-client.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey } from '@solana/web3.js';
import { DriftClient, loadKeypair, Wallet, DriftEnv, DevnetPerpMarkets, MainnetPerpMarkets, PerpMarketConfig } from '@drift-labs/sdk';

@Injectable()
export class DriftClientService implements OnModuleInit {
  private readonly logger = new Logger(DriftClientService.name);
  private driftClient: DriftClient;
  private wallet: Wallet;
  public isDevnet = false;

  constructor(private readonly configService: ConfigService) { }

  async onModuleInit() {
    await this.initializeDriftClient();
  }

  private async initializeDriftClient(): Promise<void> {
    try {
      // 1. 解析私钥
      const privateKey = this.configService.get<string>('SOLANA_PRIVATE_KEY') || '';
      this.wallet = new Wallet(loadKeypair(privateKey as any));
      const rpcUrl = this.configService.get<string>('SOLANA_RPC_URL') || '';
      // 2. 初始化 Solana 连接
      const connection = new Connection(
        rpcUrl,
        { commitment: 'confirmed' }
      );

      if (rpcUrl.includes('devnet')) {
        this.isDevnet = true;
      }

      // 3. 初始化 DriftClient
      this.driftClient = new DriftClient({
        connection,
        wallet: this.wallet,
        env: this.configService.get<DriftEnv>('DRIFT_ENV') as DriftEnv || 'devnet',
      });

      // 4. 订阅更新
      await this.driftClient.subscribe();

      this.logger.log('DriftClient initialized successfully');
    } catch (error) {
      this.logger.error(`DriftClient initialization failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取 DriftClient 实例
   */
  getClient(): DriftClient {
    if (!this.driftClient) {
      throw new Error('DriftClient is not initialized');
    }
    return this.driftClient;
  }

  /**
   * 获取当前钱包地址
   */
  getWalletAddress(): PublicKey {
    return this.wallet.publicKey;
  }

  getUser() {
    return this.driftClient.getUser();
  }

  getPerpMarketInfo(): PerpMarketConfig[] {
    if (this.isDevnet) {
      return DevnetPerpMarkets;
    }
    return MainnetPerpMarkets;
  }

  async getOpenOrders() {
    await this.driftClient.subscribe();
    return this.driftClient.getUser().getOpenOrders();
  }

  async getOrderByOrderId(orderId: number) {
    await this.driftClient.subscribe();
    console.log(this.driftClient.getUser())
    return this.driftClient.getUser().getOrder(orderId);
  }

  async cancelOrderByOrderId(orderId: number) {
    await this.driftClient.subscribe();
    return await this.driftClient.cancelOrder(orderId);
  }
}