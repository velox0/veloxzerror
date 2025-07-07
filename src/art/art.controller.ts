import { Controller, Get } from '@nestjs/common';
import { ArtService } from './art.service';

@Controller('art')
export class ArtController {
  constructor(private readonly artService: ArtService) {}

  @Get()
  getArtPage() {
    return this.artService.artPage();
  }
}
