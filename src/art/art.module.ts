import { Module } from '@nestjs/common';
import { ArtController } from './art.controller';
import { ArtService } from './art.service';
import { CreatePageService } from 'src/create-page/create-page.service';

@Module({
  controllers: [ArtController],
  providers: [ArtService, CreatePageService],
})
export class ArtModule {}
