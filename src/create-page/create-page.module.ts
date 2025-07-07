import { Module } from '@nestjs/common';
import { CreatePageService } from './create-page.service';

@Module({
  providers: [CreatePageService]
})
export class CreatePageModule {}
