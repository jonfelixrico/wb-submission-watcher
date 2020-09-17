import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices'
import { Provider } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'

const { MQ_URI } = process.env

export default {
  provide: ClientProxy,
  useFactory: (logger: Logger) => {
    logger.child({ context: 'Redis' }).info('Instantiated the Redis client.')
    return ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        url: MQ_URI,
      },
    })
  },
  inject: [WINSTON_MODULE_PROVIDER],
} as Provider
