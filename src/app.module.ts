import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloWorldModule } from './hello-world/hello-world.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({

  imports: [
     ConfigModule.forRoot({
      isGlobal: true, // <== make env variables available globally
    }),
    TypeOrmModule.forRoot({
      imports: [ConfigModule], // ✅ THIS LINE is valid
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        entities: [],
        synchronize: true,
     
      }),
    }),
    HelloWorldModule, AuthModule
  ]
  ,
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
