import { Injectable } from '@nestjs/common';
import { CreatePageService } from 'src/create-page/create-page.service';

@Injectable()
export class ArtService {
  private art: {
    key: string;
    title: string;
    description: string;
    image: string;
    color: string;
    optimized: string;
    video?: string;
  }[] = [];
  private artPage: string;

  constructor(private readonly createPageService: CreatePageService) {
    this.art = [
      {
        key: 'hAste',
        title: 'hAste',
        description: 'hAste. An autological work piece!',
        image: '/static/art/haste/haste.png',
        color: '#ff7777',
        optimized: '/static/art/haste/haste.webp',
        video: '/static/art/haste/haste.mp4',
      },
      {
        key: 'life-of-pablo',
        title: 'Life of Pablo',
        description: 'Life of Pablo - Kanye West album',
        image: '/static/art/lop/lop.png',
        color: '#ffaa99',
        optimized: '/static/art/lop/lop.webp',
        video: '/static/art/lop/lop.mp4',
      },
      {
        key: 'fireworks',
        title: 'Lights',
        description: 'Diwali - shoutout to my favorite festival!',
        image: '/static/art/lights/lights.png',
        color: '#ff7799',
        optimized: '/static/art/lights/lights.webp',
        video: '/static/art/lights/lights.mp4',
      },
      {
        key: 'f1',
        title: 'f1',
        description: 'Formula 1 - car',
        image: '/static/art/f1/f1.png',
        color: '#ff7799',
        optimized: '/static/art/f1/f1.webp',
        video: '/static/art/f1/f1.mp4',
      },
      {
        key: 'eye',
        title: 'Eye',
        description: '3d eye with geometry nodes',
        image: '/static/art/eye/eye.png',
        color: '#ccffff',
        optimized: '/static/art/eye/eye.webp',
        video: '/static/art/eye/eye.mp4',
      },
      {
        key: 'daft-punk',
        title: 'Daft Punk',
        description: 'Daft Punk - Thomas Bangalter helmet',
        image: '/static/art/daft-punk/daft-punk.png',
        color: '#ffdddd',
        optimized: '/static/art/daft-punk/daft-punk.webp',
        video: '/static/art/daft-punk/daft-punk.mp4',
      },
      {
        key: 'apple',
        title: 'Apple',
        description: 'My first 3d work. A for apple.',
        image: 'static/art/apple/apple.jpg',
        color: '#ffcccc',
        optimized: '/static/art/apple/apple.webp',
        video: '/static/art/apple/apple.mp4',
      },
    ];
    this.artPage = this.genArtPage();
  }

  private getArt() {
    return this.art.map((art) => {
      return {
        ...art,
        image: `
        <div class="post" data-key="${art.key}" data-color="${art.color}">
          <a href="/art/${art.key}" class="nostyle">
            <h2>${art.title}</h2>
            <img src="${art.optimized}" srcset="${art.image} 2x" alt="${art.description}" />
          </a>
          <div class="post-content">
            <p>${art.description}</p>
          </div>
        </div>`,
      };
    });
  }

  private genArtPage() {
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
      </div>
      <script>
      let done = false;
      let post = document.getElementsByClassName('post');
      function togglePost(index) {
        post[index].classList.add('open-post');
        if (index > 0) {
          setTimeout(() => {
            post[index].classList.remove('open-post');
            togglePost(index - 1);
          }, 150);
        } else done = true;
      }
      togglePost(post.length - 1); // start from the last post
       </script>`,
      ['/static/styles.css', '/static/posts.css'],
      ['/static/posts.js'],
    );
  }

  getArtPage() {
    return this.artPage;
  }
}
