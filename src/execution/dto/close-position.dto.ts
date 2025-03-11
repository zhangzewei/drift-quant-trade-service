import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClosePositionDto {
  @ApiProperty({ description: 'Market index (e.g., 0 for BTC-PERP)', example: 0 })
  @IsNumber()
  marketIndex: number;
}