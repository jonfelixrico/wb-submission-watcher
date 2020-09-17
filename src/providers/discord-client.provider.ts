import { Provider } from '@nestjs/common'
import { Client } from 'discord.js'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'

const { DISCORD_TOKEN } = process.env

export default {
  provide: Client,
  useFactory: (logger: Logger) =>
    new Promise((resolve, reject) => {
      logger = logger.child({ context: 'Discord' })
      const client = new Client()
      try {
        logger.info('Attempting to sign in.')
        client.login(DISCORD_TOKEN)
        client.on('ready', () => {
          resolve(client)
          logger.info('Sign in successful.')
        })

        client.on('rateLimit', data =>
          logger.error('Rate limit reached.', data)
        )
      } catch (e) {
        reject(e)
      }
    }),
  inject: [WINSTON_MODULE_PROVIDER],
} as Provider
