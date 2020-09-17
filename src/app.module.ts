import { Module } from '@nestjs/common'
import { utilities, WinstonModule } from 'nest-winston'
import { ProvidersModule } from './providers/providers.module';
import * as winston from 'winston'

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            utilities.format.nestLike()
          ),
        }),
      ],
      level: 'debug',
    }),
    ProvidersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
