import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloWorldService {
  getHello(): string {
    return 'Hello World from shaurya.deoria@gmail.com! 🚀';
  }

  greetUser(name: string): string {
    return `Hello ${name}! Welcome to the Schedula Backend by Binary Bandits team! 👋`;
  }

  getApplicationInfo(): object {
    return {
      application: 'Schedula Backend',
      team: 'Binary Bandits',
      developer: 'Shaurya Deoria',
      message: 'This is a Hello World application built with NestJS',
      endpoints: [
        'GET /hello-world - Basic hello world message',
        'GET /hello-world/greet/:name - Personalized greeting',
        'GET /hello-world/info - Application information'
      ],
      timestamp: new Date().toISOString()
    };
  }
}
