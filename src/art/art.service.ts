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
  private f1Page: string;

  constructor(private readonly createPageService: CreatePageService) {
    this.art = [
      {
        key: 'hAste',
        title: 'hAste',
        description: 'hAste. An autological work piece!',
        image: '/static/art/haste/hastec.jpg',
        color: '#ff7777',
        optimized: '/static/art/haste/haste.webp',
        video: '/static/art/haste/haste.mp4',
      },
      {
        key: 'life-of-pablo',
        title: 'Life of Pablo',
        description: 'Life of Pablo - Kanye West album',
        image: '/static/art/lop/lopc.jpg',
        color: '#ffaa99',
        optimized: '/static/art/lop/lop.webp',
        video: '/static/art/lop/lop.mp4',
      },
      {
        key: 'fireworks',
        title: 'Lights',
        description: 'Diwali - shoutout to my favorite festival!',
        image: '/static/art/lights/lightsc.jpg',
        color: '#aabbff',
        optimized: '/static/art/lights/lights.webp',
        video: '/static/art/lights/lights.mp4',
      },
      {
        key: 'f1',
        title: 'f1',
        description: 'Formula 1 - car',
        image: '/static/art/f1/f1c.jpg',
        color: '#ff7799',
        optimized: '/static/art/f1/f1.webp',
        video: '/static/art/f1/fone_compressed.mp4',
      },
      {
        key: 'eye',
        title: 'Eye',
        description: '3d eye with geometry nodes',
        image: '/static/art/eye/eyec.jpg',
        color: '#ccffff',
        optimized: '/static/art/eye/eye.webp',
        video: '/static/art/eye/eye.mp4',
      },
      {
        key: 'daft-punk',
        title: 'Daft Punk',
        description: 'Daft Punk - Thomas Bangalter helmet',
        image: '/static/art/daft-punk/daft-punkc.jpg',
        color: '#ffdddd',
        optimized: '/static/art/daft-punk/daft-punk.webp',
        video: '/static/art/daft-punk/daft-punk.mp4',
      },
      {
        key: 'apple',
        title: 'Apple',
        description: 'My first 3d work. A for apple.',
        image: 'static/art/apple/applec.jpg',
        color: '#ffcccc',
        optimized: '/static/art/apple/apple.webp',
        video: '/static/art/apple/apple.mp4',
      },
    ];
    this.artPage = this.createPageService.createPage(
      'Art - Velox0',
      `<div><a href="/" class="nostyle">← Home</a></div>
      <h1 class='h'>Art</h1>
      <p style="margin-bottom:20px;">Some stuff I made mostly in blender.</p>
      <div id="post-container" style="margin-bottom: 20px;">
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
      window.addEventListener("load",function(event) {
        togglePost(post.length - 1);
      },false);
       </script>`,
      ['/static/styles.css', '/static/posts.css', '/static/curtain.css'],
      ['/static/posts.js', '/static/curtain.js'],
      "https://velox0.com/art",
      [{ property: "og:title", content: "Art by velox0" },
      { property: "og:description", content: "A catalogue of artworks by velox0" },
      { property: "og:image", content: "https://velox0.com/static/art/haste/haste.webp" },
      { property: "og:image", content: "https://velox0.com/static/art/lop/lop.webp" },
      { property: "og:image", content: "https://velox0.com/static/art/lights/lights.webp" },
      { property: "og:image", content: "https://velox0.com/static/art/f1/f1.webp" },
      { property: "og:image", content: "https://velox0.com/static/art/eye/eye.webp" },
      { property: "og:image", content: "https://velox0.com/static/art/daft-punk/daft-punk.webp" },
      { property: "og:image", content: "https://velox0.com/static/art/apple/apple.webp" },
      { property: "og:url", content: "https://velox0.com/art" },
      { property: "og:type", content: "website" }
      ],
      "A catalogue of artworks by velox0",
      ["3d art", "blender"]
    );

    this.f1Page = this.createPageService.createPage(
      'F1',
      `<video id="bg-video" autoplay loop muted playsinline style="position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:cover;z-index:-1;pointer-events:none;">
        <source src="https://velox0.com/files/f1/bg.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <div><a href="/art" class="nostyle" style="margin-top:24px;">← Art</a></div>
      <h1 class='h' style="margin-top:12px;">F1</h1>
      <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:25px;">
        <div style="display:flex;flex-direction:column;align-items:center;">
          <video id="center-video" autoplay loop controls playsinline>
            <source src="${this.art.find(a => a.key === 'f1')?.video}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      </div>`,
      ['/static/styles.css', '/static/curtain.css', '/static/art/styles.css'],
      ['/static/curtain.js']
    );
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

  getArtPage() {
    return this.artPage;
  }

  getF1Page() {
    return this.f1Page;
  }
}
