import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { CreatePageService } from 'src/create-page/create-page.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, CreatePageService]
})
export class ProjectsModule { }
