import { Test, TestingModule } from '@nestjs/testing';
import { CreatePageService } from './create-page.service';

describe('CreatePageService', () => {
  let service: CreatePageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreatePageService],
    }).compile();

    service = module.get<CreatePageService>(CreatePageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
