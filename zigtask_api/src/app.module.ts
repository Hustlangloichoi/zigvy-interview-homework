import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri =
          configService.get<string>('MONGO_URI') || 'mongodb://localhost/nest';

        return {
          uri,
          onConnectionCreate: (connection) => {
            connection.on('connected', () => {
              console.log(' Successfully connected to MongoDB!');
            });
            connection.on('error', (error) => {
              console.error(' MongoDB connection error:', error);
            });
            connection.on('disconnected', () => {
              console.log('  MongoDB disconnected');
            });
            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
