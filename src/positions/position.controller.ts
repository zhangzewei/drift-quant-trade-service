// position.controller.ts
import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { DriftClientService } from '../drift-client/drift-client.service';
import { PerpPosition } from '@drift-labs/sdk';

@Controller('position')
export class PositionController {
  private readonly logger = new Logger(PositionController.name);

  constructor(private readonly driftClientService: DriftClientService) { }

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
}