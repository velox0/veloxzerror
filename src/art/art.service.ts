import { Injectable } from '@nestjs/common';
import { html } from '@velox0/flinch';
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
        key: '1',
        title: 'Apple',
        description: 'My first 3d work. A for apple.',
        image: 'static/art/apple/apple.jpg',
        video: '/static/art/apple/apple.mp4',
      },
      {
        key: '2',
        title: 'Eye',
        description: '3d eye with geometry nodes',
        image: '/static/art/eye/eye.png',
        video: '/static/art/eye/eye.mp4',
      },
      {
        key: '3',
        title: 'Daft Punk',
        description: 'Daft Punk -Thomas Bangalter- helmet',
        image: '/static/art/daft-punk/daft-punk.png',
        video: '/static/art/daft-punk/daft-punk.mp4',
      },
      {
        key: '4',
        title: 'Life of Pablo',
        description: 'Life of Pablo - Kanye West - album cover',
        image: '/static/art/lop/lop.png',
        video: '/static/art/lop/lop.mp4',
      },
      {
        key: '5',
        title: 'hAste',
        description: 'hAste. How a lot of things are done in a hurry.',
        image: '/static/art/haste/haste.png',
        video: '/static/art/haste/haste.mp4',
      },
      {
        key: '6',
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
        image: html`<div class="post">
          <h2>${art.title}</h2>
          <img src="${art.image}" alt="${art.title}" />
          <div class="post-content">
            <p>${art.description}</p>
          </div>
        </div>`.toString(),
      };
    });
  }

  artPage() {
    return this.createPageService.createPage(
      'Art',
      `<h1 class='h'>Art</h1>
      <p>Some stuff I made mostly in blender.</p>
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
