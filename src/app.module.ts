import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloWorldModule } from './hello-world/hello-world.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({

  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'your_db_password',
      database: 'auth_db',
      entities: [],
      synchronize: true,
    }),
    HelloWorldModule, AuthModule
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
