// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DriftClientService } from './drift-client/drift-client.service';
import { PerpOrderExecutorService } from './execution/perp-order-executor.service';
import { PerpOrderExecutorController } from './execution/perp-order-executor.controller';
import { MarketsController } from './markets/markets.controller';
import { OrdersController } from './orders/orders.controller';
import { PositionController } from './positions/position.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [PerpOrderExecutorController, MarketsController, OrdersController, PositionController],
  providers: [PerpOrderExecutorService, DriftClientService],
})
export class AppModule { }