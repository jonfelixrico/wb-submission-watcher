import { Module } from '@nestjs/common'
import { ReactionsWatcherService } from './reactions-watcher/reactions-watcher.service'

@Module({
  providers: [ReactionsWatcherService],
  exports: [ReactionsWatcherService],
})
export class ServicesModule {}
