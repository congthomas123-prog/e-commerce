import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '@org/common';
import { DatabaseModule, getDatabaseUrl } from '@org/database';
import { createOrderPrismaClient } from './orders/database/order-prisma-client.factory';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/order-service/.env'],
    }),
    CommonModule,
    DatabaseModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (...args) => {
        const [configService] = args as [ConfigService];

        return {
          client: createOrderPrismaClient(
            getDatabaseUrl({
              DATABASE_URL: configService.get<string>('DATABASE_URL'),
            }),
          ),
        };
      },
    }),
    OrdersModule,
  ],
})
export class AppModule {}
