import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '@org/common';
import { DatabaseModule, getDatabaseUrl } from '@org/database';
import { AuthModule } from './auth/auth.module';
import { createAuthPrismaClient } from './auth/database/auth-prisma-client.factory';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/auth-service/.env'],
    }),
    CommonModule,
    DatabaseModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (...args) => {
        const [configService] = args as [ConfigService];

        return {
          client: createAuthPrismaClient(
            getDatabaseUrl({
              DATABASE_URL: configService.get<string>('DATABASE_URL'),
            }),
          ),
        };
      },
    }),
    AuthModule,
  ],
})
export class AppModule {}
