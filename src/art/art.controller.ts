import { Controller, Get, Req } from '@nestjs/common';
import { ArtService } from './art.service';
import { CreatePageService } from '../create-page/create-page.service';

@Controller('art')
export class ArtController {
  constructor(
    private readonly artService: ArtService,
    private readonly createPageService: CreatePageService,
  ) {}

  @Get()
  getArtPage() {
    return this.artService.artPage();
  }

  @Get('/*')
  getNotFoundPage(@Req() req: Request) {
    return this.createPageService.createErrorPage(
      req.url || 'Art',
      'This page does not exist yet!',
      { text: 'Art', href: '/art' },
    );
  }
}
