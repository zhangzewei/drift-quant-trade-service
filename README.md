# Drift Quant Trade Service

This is a nestjs project based on [drift](https://drift-labs.github.io/v2-teacher/#introduction) sdk.

The drift is based on [solana](https://solana.com/)

## Features
1. Create perp order (market / limit).
2. View opening orders
3. Cancel opening orders
4. Close perp market position

## Setup
1. Install dependencies
```bash
npm install
```
2. Setup env variables
```bash
cp .env.example .env
```
3. Run the project
```bash
npm run start:dev
```
4. Send requests to [localhost:3000](http://localhost:3000)

## Swagger
Swagger UI is available at [http://localhost:3000/api](http://localhost:3000/api)

## APIs
- PerpOrderExecutor
  - POST /perp-orders/market (Place a market order)
  - POST /perp-orders/limit (Place a limit order)

- Markets
  - GET /markets (Get perpetual markets info)
  - GET /markets/account (Get perpetual account info)

- Orders
  - GET /orders (Get user orders)
  - GET /orders/detail (Get order detail)
  - DELETE /orders/{orderId} (Cancel an order)

- Position
  - GET /position
  - POST /position/close (Close Position)