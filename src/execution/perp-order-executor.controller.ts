// perp-order-executor.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { PerpOrderExecutorService } from './perp-order-executor.service';
import { PositionDirection, OrderType, OptionalOrderParams, BN } from '@drift-labs/sdk';
import { IPositionDirection, PlaceOrderDto } from './dto/place-order.dto';
import { ConditionalOrderDto } from './dto/conditional-order.dto';
import { ClosePositionDto } from './dto/close-position.dto';
import { DriftClientService } from 'src/drift-client/drift-client.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

@Controller('perp-orders')
@UsePipes(new ValidationPipe({ transform: true }))
export class PerpOrderExecutorController {
  private readonly logger = new Logger(PerpOrderExecutorController.name);
  constructor(
    private readonly perpExecutor: PerpOrderExecutorService,
    private readonly driftClientService: DriftClientService,
  ) { }

  async placePerpOrder(params: OptionalOrderParams): Promise<{ txSignature: string }> {
    try {
      const { direction } = params;
      if (direction === IPositionDirection.LONG) {
        params.direction = PositionDirection.LONG;
      }
      if (direction === IPositionDirection.SHORT) {
        params.direction = PositionDirection.SHORT;
      }
      const txSignature = await this.perpExecutor.placePerpOrder(params);
      return { txSignature };
    } catch (error) {
      this.logger.error(`Order failed: ${error.message}`, error.stack);
      throw new HttpException(
        { message: 'Failed to place order', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 执行永续合约限价单
   */
  // async placeLimitOrder(
  //   marketIndex: number,
  //   direction: PositionDirection,
  //   size: number,
  //   price: number,
  // ): Promise<{ txSignature: string }> {
  //   try {
  //     const txSignature = await this.perpExecutor.placePerpOrder({
  //       marketIndex,
  //       direction,
  //       size,
  //       price,
  //       orderType: OrderType.Limit,
  //     });
  //     return { txSignature };
  //   } catch (error) {
  //     this.logger.error(`Limit order failed: ${error.message}`, error.stack);
  //     throw new HttpException(
  //       { message: 'Failed to place limit order', details: error.message },
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  /**
   * 附加条件单（止盈/止损）
   */
  // async attachConditionalOrder(
  //   @Body('marketIndex') marketIndex: number,
  //   @Body('triggerPrice') triggerPrice: number,
  //   @Body('triggerType') triggerType: 'TakeProfit' | 'StopLoss',
  // ): Promise<{ txSignature: string }> {
  //   try {
  //     const txSignature = await this.perpExecutor.attachConditionalOrder(
  //       marketIndex,
  //       triggerPrice,
  //       triggerType,
  //     );
  //     return { txSignature };
  //   } catch (error) {
  //     this.logger.error(`Conditional order failed: ${error.message}`, error.stack);
  //     throw new HttpException(
  //       { message: 'Failed to attach conditional order', details: error.message },
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  @Post('market')
  @ApiOperation({ summary: 'Place a market order' })
  @ApiBody({ type: PlaceOrderDto })
  @ApiResponse({ status: 201, description: 'Market order placed successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async placeMarketOrder(@Body() body: PlaceOrderDto): Promise<{ txSignature: string }> {
    const { marketIndex, direction, baseAssetAmount } = body;
    return this.placePerpOrder({
      marketIndex,
      direction,
      baseAssetAmount: this.driftClientService.getClient().convertToPricePrecision(baseAssetAmount),
      orderType: OrderType.MARKET
    });
  }

  @Post('limit')
  @ApiOperation({ summary: 'Place a limit order' })
  @ApiBody({ type: PlaceOrderDto })
  @ApiResponse({ status: 201, description: 'Limit order placed successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async placeLimitOrder(@Body() body: PlaceOrderDto): Promise<{ txSignature: string }> {
    const { marketIndex, direction, baseAssetAmount } = body;
    if (!body.price) {
      throw new HttpException(
        { message: 'Price is required for limit orders' },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.placePerpOrder({
      marketIndex,
      direction,
      baseAssetAmount: this.driftClientService.getClient().convertToPricePrecision(baseAssetAmount),
      orderType: OrderType.LIMIT,
      price: this.driftClientService.getClient().convertToPricePrecision(body.price),
    });
  }

  // @Post('conditional')
  // async attachConditionalOrder(@Body() body: ConditionalOrderDto): Promise<{ txSignature: string }> {
  //   const { marketIndex, triggerPrice, triggerType } = body;
  //   return this.attachConditionalOrder(marketIndex, triggerPrice, triggerType);
  // }

  @Post('close')
  @ApiOperation({ summary: 'Close a position' })
  @ApiBody({ type: ClosePositionDto })
  @ApiResponse({ status: 201, description: 'Position closed successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async closePosition(@Body() body: ClosePositionDto): Promise<{ txSignature: string }> {
    const { marketIndex } = body;
    const txSignature = await this.perpExecutor.closePosition(marketIndex);
    return { txSignature };
  }
}