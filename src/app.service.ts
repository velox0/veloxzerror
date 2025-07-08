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
              email:
              <a
                href="mailto:biz@velox0.com"
                target="_blank"
                rel="noopener noreferrer"
                class="email"
                >biz@velox0.com</a
              >
            </div>
            <h2>Check out my resume <a href="/resume">here</a>.</h2>
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
            async function writeTech(ctx) {
              ctx.innerText = '';
              for (let j = 0; j < techStack[i].length; j++) {
                ctx.innerText = techStack[i].slice(0, j + 1);
                await new Promise((resolve) =>
                  setTimeout(resolve, 500 / techStack[i].length),
                );
              }
            }
            setInterval(() => {
              writeTech(tech);
              i = (i + 1) % techStack.length;
            }, 3000);
          </script>
        </body>
      </html>`.toString();
  }

  getResume(): string {
    return `<!DOCTYPE html>
      <html lang="en">
        ${this.createPageService.createHead('Velox0 - Resume')}
        <body>
          <div id="app">
            <p><a href="/" class="nostyle">← Home</a></p>
            <h1 class="h">Resume</h1>
            <img src="https://media1.tenor.com/m/f7K_LN-WfZIAAAAC/sparkles-and-champagne.gif" alt="Resume" />
          </div>
        </body>
      </html>`;
  }
}
