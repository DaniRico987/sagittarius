import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        retryAttempts: 3,
        retryDelay: 1000,
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('✅ MongoDB connected successfully');
          });
          connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
          });
          connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    MessagesModule,
    AuthModule,
  ],
})
export class AppModule {}
