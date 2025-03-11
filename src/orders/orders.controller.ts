// orders.controller.ts
import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Logger,
  Delete,
  Param,
} from '@nestjs/common';
import { DriftClientService } from '../drift-client/drift-client.service';
import { Order } from '@drift-labs/sdk';
import { ApiOperation, ApiResponse, ApiInternalServerErrorResponse, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly driftClientService: DriftClientService) { }

  /**
   * 获取用户的所有订单
   */
  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  @ApiResponse({ status: 200, description: 'List of user orders' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getOpenOrders(): Promise<Order[]> {
    try {
      const orders = await this.driftClientService.getOpenOrders();
      return orders;
    } catch (error) {
      this.logger.error(`Failed to fetch orders: ${error.message}`, error.stack);
      throw new HttpException(
        { message: 'Failed to fetch orders', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取订单详情
   */
  @Get('detail')
  @ApiOperation({ summary: 'Get order detail' })
  @ApiResponse({ status: 200, description: 'Order detail' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getOrderDetail(@Query('orderId') orderId: number): Promise<Order> { // 通过 @Query 装饰器获取查询参数
    try {
      const order = await this.driftClientService.getOrderByOrderId(orderId);
      if (!order) {
        throw new HttpException(
          { message: 'Order not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return order;
    } catch (error) {
      this.logger.error(`Failed to fetch order detail: ${error.message}`, error.stack);
      throw new HttpException(
        { message: 'Failed to fetch order detail', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 删除指定订单
   * @param orderId 订单 ID
   */
  @Delete(':orderId')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'orderId', type: Number, required: true })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async cancelOrder(@Param('orderId') orderId: number): Promise<{ txSignature: string }> {
    try {
      const txSignature = await this.driftClientService.cancelOrderByOrderId(orderId);
      return { txSignature };
    } catch (error) {
      this.logger.error(`Failed to cancel order: ${error.message}`, error.stack);
      throw new HttpException(
        { message: 'Failed to cancel order', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}