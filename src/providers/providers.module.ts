import { Module } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Client } from 'discord.js'
import DiscordClientProvider from './discord-client.provider'
import RedisClientProvider from './redis-client.provider'

@Module({
  providers: [RedisClientProvider, DiscordClientProvider],
  exports: [ClientProxy, Client],
})
export class ProvidersModule {}
