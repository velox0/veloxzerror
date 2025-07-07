import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { CreatePageService } from './create-page/create-page.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly createPageService: CreatePageService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
