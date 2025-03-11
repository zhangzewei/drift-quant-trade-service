import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConditionalOrderDto {
  @ApiProperty({ description: 'Market index (e.g., 0 for BTC-PERP)', example: 0 })
  @IsNumber()
  marketIndex: number;

  @ApiProperty({ description: 'Trigger price (e.g., 55000 for TakeProfit)', example: 55000 })
  @IsNumber()
  triggerPrice: number;

  @ApiProperty({ enum: ['TakeProfit', 'StopLoss'], description: 'Trigger type (TakeProfit or StopLoss)', example: 'TakeProfit' })
  @IsString()
  triggerType: 'TakeProfit' | 'StopLoss';
}
