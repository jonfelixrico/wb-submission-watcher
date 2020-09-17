import { Test, TestingModule } from '@nestjs/testing';
import { ReactionsWatcherService } from './reactions-watcher.service';

describe('ReactionsWatcherService', () => {
  let service: ReactionsWatcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReactionsWatcherService],
    }).compile();

    service = module.get<ReactionsWatcherService>(ReactionsWatcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
