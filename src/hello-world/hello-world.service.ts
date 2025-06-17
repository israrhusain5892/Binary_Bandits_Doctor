import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloWorldService {
  getHello(): string {
    return 'Hello World from israrhusain5892@gmail.com!';
  }

  greetUser(name: string): string {
    return `Hello ${name}! Welcome to the Israr Backend by Binary Bandits team! 👋`;
  }

  getApplicationInfo(): object {
    return {
      application: 'Nest Js Backend',
      team: 'Binary Bandits',
      developer: 'Israr Husain',
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
