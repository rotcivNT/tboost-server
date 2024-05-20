import { Module } from '@nestjs/common';
import { LoggerModule as PinoLogerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLogerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
  ],
})
export class LoggerModule {}
