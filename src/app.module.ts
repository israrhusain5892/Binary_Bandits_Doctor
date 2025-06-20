import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloWorldModule } from './hello-world/hello-world.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './auth/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import dbConfigProduction from './config/db.config.production';
import dbConfig from './config/db.config';
@Module({

  imports: [
    ConfigModule.forRoot({ isGlobal: true,expandVariables:true,load:[dbConfig,dbConfigProduction] }),
    TypeOrmModule.forRootAsync({
      useFactory:
      process.env.NODE_ENV==='production'?dbConfigProduction:dbConfig
      }),
     HelloWorldModule, AuthModule
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
