// drift-client.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey } from '@solana/web3.js';
import { DriftClient, loadKeypair, Wallet, DriftEnv, DevnetPerpMarkets, MainnetPerpMarkets, PerpMarketConfig, PerpPosition, convertToNumber, BASE_PRECISION } from '@drift-labs/sdk';

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
    return this.driftClient.getUser().getOrder(orderId);
  }

  async cancelOrderByOrderId(orderId: number) {
    await this.driftClient.subscribe();
    const order = this.driftClient.getUser().getOrder(orderId);
    if (!order) {
      throw new Error(`Order not found for order ID ${orderId}`);
    }
    return await this.driftClient.cancelOrder(orderId);
  }

  /**
   * 获取用户的所有仓位
   * @param marketIndex 市场索引
   */
  async getUserPosition(marketIndex: number): Promise<PerpPosition> {
    await this.driftClient.subscribe(); // 确保订阅更新
    const userPositions = this.driftClient.getUser().getPerpPosition(Number(marketIndex));
    if (!userPositions) {
      throw new Error(`No position found for market index ${marketIndex}`);
    }
    return userPositions;
  }

  /**
   * 获取marketIndex对应的市场信息
   * @param marketIndex 市场索引
   */
  getMarketDetail(marketIndex: number) {
    const market = this.driftClient.getPerpMarketAccount(Number(marketIndex));
    if (!market) {
      throw new Error(`No market found for market index ${marketIndex}`);
    }
    console.log(this.driftClient.convertToPerpPrecision(10), convertToNumber(this.driftClient.convertToPerpPrecision(10), BASE_PRECISION))
    console.log(convertToNumber(market.amm.minOrderSize, BASE_PRECISION), convertToNumber(market.amm.orderStepSize, BASE_PRECISION))
    return market;
  }
}