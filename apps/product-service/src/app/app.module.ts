import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '@org/common';
import { DatabaseModule, getDatabaseUrl } from '@org/database';
import { createProductPrismaClient } from './products/database/product-prisma-client.factory';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/product-service/.env'],
    }),
    CommonModule,
    DatabaseModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (...args) => {
        const [configService] = args as [ConfigService];

        return {
          client: createProductPrismaClient(
            getDatabaseUrl({
              DATABASE_URL: configService.get<string>('DATABASE_URL'),
            }),
          ),
        };
      },
    }),
    ProductsModule,
  ],
})
export class AppModule {}
