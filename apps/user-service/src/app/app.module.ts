import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '@org/common';
import { DatabaseModule, getDatabaseUrl } from '@org/database';
import { createUserPrismaClient } from './users/database/user-prisma-client.factory';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/user-service/.env'],
    }),
    CommonModule,
    DatabaseModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (...args) => {
        const [configService] = args as [ConfigService];

        return {
          client: createUserPrismaClient(
            getDatabaseUrl({
              DATABASE_URL: configService.get<string>('DATABASE_URL'),
            }),
          ),
        };
      },
    }),
    UsersModule,
  ],
})
export class AppModule {}
