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
       inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('dbconfig');
        if (!config) {
          throw new Error('Database config not loaded!');
        }
        return config;
      },
      
    }),
//     TypeOrmModule.forRoot({

 
//     type: 'postgres', // or your preferred DB
//     host: 'localhost',
//     port: 5433,
//     username: 'postgres',
//     password: '123456',
//     database: 'doctor',
//     autoLoadEntities: true,
//     synchronize: true,
//     entities:[User]
 
 
// }),

    HelloWorldModule, AuthModule
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
console.log(process.env.DB_PASSWORD);