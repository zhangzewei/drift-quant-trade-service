import { IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum IPositionDirection {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export class PlaceOrderDto {
  @ApiProperty({ description: 'Market index (e.g., 0 for BTC-PERP)', example: 0 })
  @IsNumber()
  marketIndex: number;

  @ApiProperty({ enum: IPositionDirection, description: 'Trade direction (LONG or SHORT)', example: 'LONG' })
  @IsEnum(IPositionDirection)
  direction: IPositionDirection;

  @ApiProperty({ description: 'Order size (e.g., 1 BTC)', example: 1 })
  @IsNumber()
  baseAssetAmount: number;

  @ApiProperty({ description: 'Limit price (required for limit orders)', example: 100, required: false })
  @IsNumber()
  price?: number;
}