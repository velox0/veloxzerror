import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ArtModule } from './art/art.module';
import { CreatePageModule } from './create-page/create-page.module';
import { CreatePageService } from './create-page/create-page.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      serveRoot: '/static',
    }),
    ArtModule,
    CreatePageModule,
  ],
  controllers: [AppController],
  providers: [AppService, CreatePageService],
})
export class AppModule {}
