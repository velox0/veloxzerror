import { Injectable } from '@nestjs/common';
import { html } from '@velox0/flinch';
import { CreatePageService } from './create-page/create-page.service';

@Injectable()
export class AppService {
  constructor(private readonly createPageService: CreatePageService) {}

  getHello(): string {
    return html`<!DOCTYPE html>
      <html lang="en">
        ${this.createPageService.createHead('Velox0')}
        <body>
          <div id="app">
            <h1 class="h">I am Velox0</h1>
            <div>My name is Veloxzerror.</div>
            <div>
              I am a backend developer (and a bit of
              <a href="/art">artist</a>?).
            </div>
            <div>I write my own libraries when bored.</div>
            <div>I write in C, C++, JS, TS, Python, Go, and more.</div>
            <div>
              I am experienced in
              <span id="tech">AWS (EC2, Lightsail, etc.)</span>
            </div>
            <div>
              github:
              <a
                href="https://github.com/velox0"
                target="_blank"
                rel="noopener noreferrer"
                class="github"
                >Velox0</a
              >
            </div>
            <div>
              gitlab:
              <a
                href="https://gitlab.com/velox0"
                target="_blank"
                rel="noopener noreferrer"
                class="gitlab"
                >Velox0</a
              >
            </div>
            <div>
              email:
              <a
                href="mailto:veloxzerror@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                class="email"
                >veloxzerror@gmail.com</a
              >
            </div>
            <div>
              discord:
              <a
                href="https://discord.com/users/velox0"
                target="_blank"
                rel="noopener noreferrer"
                class="discord"
                >velox0</a
              >
            </div>
          </div>
          <script>
            const techStack = [
              'AWS (EC2, Lightsail, etc.)',
              'CockroachDB',
              'Docker',
              'GitHub Actions',
              'Nginx',
              'MongoDB',
              'and much more!',
            ];
            let i = 1;
            const tech = document.getElementById('tech');
            async function writeTech(ctx, i) {
              ctx.innerText = '';
              for (let j = 0; j < techStack[i].length; j++) {
                ctx.innerHTML += techStack[i][j];
                await new Promise((resolve) =>
                  setTimeout(resolve, 500 / techStack[i].length),
                );
              }
            }
            setInterval(() => {
              writeTech(tech, i);
              i = (i + 1) % techStack.length;
            }, 3000);
          </script>
        </body>
      </html>`.toString();
  }
}
