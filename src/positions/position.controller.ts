// position.controller.ts
import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Body,
} from '@nestjs/common';
import { DriftClientService } from '../drift-client/drift-client.service';
import { PerpPosition } from '@drift-labs/sdk';
import { PerpOrderExecutorService } from 'src/execution/perp-order-executor.service';
import { ApiOperation, ApiBody, ApiResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { PlaceOrderDto } from 'src/execution/dto/place-order.dto';
import { ClosePositionDto } from './dto';

@Controller('position')
export class PositionController {
  private readonly logger = new Logger(PositionController.name);

  constructor(private readonly driftClientService: DriftClientService,
    private readonly perpOrderExecutorService: PerpOrderExecutorService
  ) { }

  /**
   * 获取某个市场下的所有仓位
   * @param marketIndex 市场索引
   */
  @Get()
  async getPosition(
    @Query('marketIndex') marketIndex: number,
  ): Promise<PerpPosition> {
    try {
      const position = await this.driftClientService.getUserPosition(marketIndex);
      return position;
    } catch (error) {
      this.logger.error(`Failed to fetch positions: ${error.message}`, error.stack);
      throw new HttpException(
        { message: 'Failed to fetch positions', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 关闭仓位
   * @param marketIndex 市场索引
   */
  @Post('close')
  @ApiOperation({ summary: 'Close Position' })
  @ApiBody({ type: ClosePositionDto })
  @ApiResponse({ status: 201, description: 'Position closed successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async closePosition(
    @Body() body: ClosePositionDto,
  ): Promise<{ txSignature: string }> {
    try {
      const { marketIndex } = body;
      const txSignature = await this.perpOrderExecutorService.closePosition(marketIndex);
      return { txSignature };
    } catch (error) {
      this.logger.error(`Failed to close position: ${error.message}`, error.stack);
      throw new HttpException(
        { message: 'Failed to close position', details: error.message },  // 返回错误信息
        HttpStatus.INTERNAL_SERVER_ERROR,  // 返回状态码
      );
    }
  }
}