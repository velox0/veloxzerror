import { Injectable } from '@nestjs/common';

@Injectable()
export class CreatePageService {
  createHead(
    title: string,
    styles: string[] = [],
    scripts: string[] = [],
  ): string {
    return `
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <link rel="icon" type="image/x-icon" href="static/favicon.ico" />
        <link rel="stylesheet" href="static/styles.css" />
        ${styles
          .map((style) => `<link rel="stylesheet" href="${style}" />`)
          .join('')}
        ${scripts
          .map((script) => `<script src="${script}" defer></script>`)
          .join('')}
      </head>
    `;
  }

  createPage(
    title: string,
    body: string,
    styles: string[] = [],
    scripts: string[] = [],
  ): string {
    return `<!DOCTYPE html>
      <html lang="en">
        ${this.createHead(title, styles, scripts)}
        <body>
          <div id="app">${body}</div>
        </body>
      </html> `;
  }
}
