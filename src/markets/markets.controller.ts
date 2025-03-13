// markets.controller.ts
import { Controller, Get, HttpException, HttpStatus, Logger, Query } from '@nestjs/common';
import { DriftClientService } from '../drift-client/drift-client.service';
import { PerpMarketAccount, PerpMarketConfig } from '@drift-labs/sdk';
import { ApiInternalServerErrorResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Markets')
@Controller('markets')
export class MarketsController {
  private readonly logger = new Logger(MarketsController.name);

  constructor(private readonly driftClientService: DriftClientService) { }

  /**
   * 获取永续合约市场信息
   */
  @Get()
  @ApiOperation({ summary: 'Get perpetual markets info' })
  @ApiResponse({ status: 200, description: 'List of perpetual markets' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getPerpMarkets(): Promise<PerpMarketConfig[]> {
    try {
      const markets = this.driftClientService.getPerpMarketInfo();
      return markets;
    } catch (error) {
      this.logger.error(`Failed to fetch perp markets: ${error.message}`, error.stack);
      throw new HttpException(
        { message: 'Failed to fetch perp markets', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取永续合约账户信息
   */
  @Get('account')
  @ApiOperation({ summary: 'Get perpetual account info' })
  @ApiResponse({ status: 200, description: 'Perpetual account info' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getPerpAccount(
    @Query('marketIndex') marketIndex: number,
  ): Promise<PerpMarketAccount> {
    try {
      const account = this.driftClientService.getMarketDetail(marketIndex);
      return account;
    } catch (error) {
      this.logger.error(`Failed to fetch perp account: ${error.message}`, error.stack);
      throw new HttpException(
        { message: 'Failed to fetch perp account', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}