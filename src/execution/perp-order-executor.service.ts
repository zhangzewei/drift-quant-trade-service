// perp-order-executor.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  DriftClient,
  PositionDirection,
  OrderType,
  OptionalOrderParams,
  PerpPosition
} from '@drift-labs/sdk';
import { DriftClientService } from 'src/drift-client/drift-client.service';
// import { RiskManagerService } from '../risk-manager/risk-manager.service';

export interface PerpOrderParams {
  marketIndex: number;
  direction: PositionDirection;
  size: number;
  orderType: OrderType;
  price?: number;
  reduceOnly?: boolean;
  triggerPrice?: number;
}

@Injectable()
export class PerpOrderExecutorService implements OnModuleInit {
  private readonly logger = new Logger(PerpOrderExecutorService.name);
  private driftClient: DriftClient;
  private activePositions = new Map<string, PerpPosition>();

  constructor(
    private readonly driftClientService: DriftClientService,
    // private readonly riskManager: RiskManagerService,
  ) {
  }
  onModuleInit() {
    this.logger.log('PerpOrderExecutorService initialized');
  }

  /**
   * 执行永续合约订单（核心方法）
   * @param params 订单参数
   * @returns 交易签名
   */
  async placePerpOrder(params: OptionalOrderParams): Promise<string> {
    try {
      // const { marketIndex, direction, orderType, price, reduceOnly, triggerPrice } = params;

      // 风控检查
      // if (!this.riskManager.validatePerpOrder({
      //   marketIndex,
      //   size,
      //   leverage: this.driftClient.getUserLeverage(),
      // })) {
      //   throw new Error('Order rejected by risk management');
      // }

      // 提交订单
      const driftClient = this.driftClientService.getClient();
      const txSignature = await driftClient.placePerpOrder(params);

      // 更新仓位缓存
      await this.refreshPositions();

      this.logger.log(`Perp order placed successfully: ${txSignature}`);
      return txSignature;
    } catch (error) {
      this.logger.error(`Failed to place perp order: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 设置杠杆
   * @param marketIndex 市场索引
   * @param leverage 杠杆倍数
   */
  // async setLeverage(marketIndex: number, leverage: number): Promise<void> {
  //   try {
  //     await this.driftClient.updateLeverage(marketIndex, leverage);
  //     this.logger.log(`Leverage set to ${leverage}x for market ${marketIndex}`);
  //   } catch (error) {
  //     this.logger.error(`Leverage update failed: ${error.message}`, error.stack);
  //     throw error;
  //   }
  // }

  /**
   * 设置保证金模式
   * @param marginType 保证金类型：Cross 或 Isolated
   */
  // async setMarginType(marginType: MarginType): Promise<void> {
  //   try {
  //     await this.driftClient.updateMarginType(marginType);
  //     this.logger.log(`Margin type updated to ${marginType}`);
  //   } catch (error) {
  //     this.logger.error(`Margin type update failed: ${error.message}`, error.stack);
  //     throw error;
  //   }
  // }

  /**
   * 获取当前仓位信息
   */
  refreshPositions() {
    try {
      const driftClient = this.driftClientService.getClient();
      const positions = driftClient.getUser().getActivePerpPositions();
      this.activePositions.clear();
      positions.forEach(pos => {
        this.activePositions.set(pos.marketIndex.toString(), pos);
      });
    } catch (error) {
      this.logger.error(`Position refresh failed: ${error.message}`, error.stack);
    }
  }

  /**
   * 关闭指定仓位
   * @param marketIndex 市场索引
   */
  async closePosition(marketIndex: number): Promise<string> {
    try {
      const txSignature = await this.driftClient.closePosition(marketIndex);
      this.refreshPositions();
      this.logger.log(`Position closed for market ${marketIndex}: ${txSignature}`);
      return txSignature;
    } catch (error) {
      this.logger.error(`Position close failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 附加条件单（止盈/止损）
   * @param marketIndex 市场索引
   * @param triggerPrice 触发价格
   * @param triggerType 触发类型：TakeProfit/StopLoss
   */
  // async attachConditionalOrder(
  //   marketIndex: number,
  //   triggerPrice: number,
  //   triggerType: 'TakeProfit' | 'StopLoss'
  // ): Promise<string> {
  //   try {
  //     const txSignature = await this.driftClient.addTrigger(
  //       marketIndex,
  //       this.activePositions.get(marketIndex.toString())!.id,
  //       {
  //         triggerType,
  //         triggerPrice,
  //       }
  //     );
  //     this.logger.log(`${triggerType} order attached: ${txSignature}`);
  //     return txSignature;
  //   } catch (error) {
  //     this.logger.error(`Conditional order attach failed: ${error.message}`, error.stack);
  //     throw error;
  //   }
  // }
}