import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloWorldModule } from './hello-world/hello-world.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/database.config';
import { User } from './auth/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({

  imports: [
    // ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({

 
    type: 'postgres', // or your preferred DB
    host: 'localhost',
    port: 5433,
    username: 'postgres',
    password: '123456',
    database: 'doctor',
    autoLoadEntities: true,
    synchronize: true,
    entities:[User]
 
 
}),

    HelloWorldModule, AuthModule
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
