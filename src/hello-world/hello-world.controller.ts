import { Controller, Get, Param } from '@nestjs/common';
import { HelloWorldService } from './hello-world.service';

@Controller('hello-world')
export class HelloWorldController {
  constructor(private readonly helloWorldService: HelloWorldService) {}

  @Get()
  getHello(): string {
    return this.helloWorldService.getHello();
  }

  @Get('greet/:name')
  greetUser(@Param('name') name: string): string {
    return this.helloWorldService.greetUser(name);
  }

  @Get('info')
  getInfo(): object {
    return this.helloWorldService.getApplicationInfo();
  }
}
