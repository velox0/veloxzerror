import { Injectable } from '@nestjs/common';
import { CreatePageService } from 'src/create-page/create-page.service';

@Injectable()
export class ArtService {
  art: {
    key: string;
    title: string;
    description: string;
    image: string;
    video?: string;
  }[] = [];

  constructor(private readonly createPageService: CreatePageService) {
    this.art = [
      {
        key: 'apple',
        title: 'Apple',
        description: 'My first 3d work. A for apple.',
        image: 'static/art/apple/apple.jpg',
        video: '/static/art/apple/apple.mp4',
      },
      {
        key: 'eye',
        title: 'Eye',
        description: '3d eye with geometry nodes',
        image: '/static/art/eye/eye.png',
        video: '/static/art/eye/eye.mp4',
      },
      {
        key: 'daft-punk',
        title: 'Daft Punk',
        description: 'Daft Punk - Thomas Bangalter helmet',
        image: '/static/art/daft-punk/daft-punk.png',
        video: '/static/art/daft-punk/daft-punk.mp4',
      },
      {
        key: 'life-of-pablo',
        title: 'Life of Pablo',
        description: 'Life of Pablo - Kanye West album',
        image: '/static/art/lop/lop.png',
        video: '/static/art/lop/lop.mp4',
      },
      {
        key: 'hAste',
        title: 'hAste',
        description: 'hAste. How a lot of things are done in a hurry.',
        image: '/static/art/haste/haste.png',
        video: '/static/art/haste/haste.mp4',
      },
      {
        key: 'f1',
        title: 'f1',
        description: 'Formula 1 - car',
        image: '/static/art/f1/f1.png',
        video: '/static/art/f1/f1.mp4',
      },
    ];
  }

  private getArt() {
    return this.art.map((art) => {
      return {
        ...art,
        image: `
        <div class="post" data-key="${art.key}">
          <a href="/art/${art.key}" class="nostyle">
            <h2>${art.title}</h2>
            <img src="${art.image}" alt="${art.title}" />
          </a>
          <div class="post-content">
            <p>${art.description}</p>
          </div>
        </div>`,
      };
    });
  }

  artPage() {
    return this.createPageService.createPage(
      'Art',
      `<p><a href="/" class="nostyle">← Home</a></p>
      <h1 class='h'>Art</h1>
      <p>Some stuff I made mostly in blender.</p>
      <p class="mobile-only">This page is meant to be viewed on desktop.
      </p>
      <div id="post-container">
      ${this.getArt()
        .map((art) => art.image)
        .join('')}
      </div>`,
      ['/static/styles.css', '/static/posts.css'],
      ['/static/posts.js'],
    );
  }
}
