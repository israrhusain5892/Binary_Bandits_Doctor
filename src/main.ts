import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as cookieParser from  'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin:true,
    credential:"http://localhost:3000"
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // strip out unexpected properties
      forbidNonWhitelisted: true,   // throw on extra props
      transform: true, 
                 // convert payloads into DTO class instances
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
