import { Injectable } from '@nestjs/common';

@Injectable()
export class CreatePageService {
  createHead(
    title: string,
    styles: string[] = [],
    scripts: string[] = [],
    href: string,
    metadata?: {property: string, content: string}[],
    description?: string,
  ): string {
    return `
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="stylesheet" href="static/styles.css" />
        <link rel="canonical" href="${href}" />
        ${metadata
          ?.map((meta) => `<meta property="${meta.property}" content="${meta.content}" />`)
          .join('') || ''}
        ${styles
          .map((style) => `<link rel="stylesheet" href="${style}" />`)
          .join('')}
        ${scripts
          .map((script) => `<script src="${script}" defer></script>`)
          .join('')}
        ${description?`<meta name="description" content="`+ description + `" />`: ""}
      </head>
    `;
  }

  createPage(
    title: string,
    body: string,
    styles: string[] = [],
    scripts: string[] = [],
    href?: string,
    metadata?: {property: string, content: string}[],
    description?: string,
  ): string {
    return `<!DOCTYPE html>
      <html lang="en">
        ${this.createHead(title, styles, scripts, href || '/', metadata, description)}
        <body>
          <div id="app">${body}</div>
        </body>
      </html> `;
  }

  createErrorPage(
    title: string,
    error: string,
    backlink?: { text: string; href: string },
    metadata?: {property: string, content: string}[],
  ): string {
    return `<!DOCTYPE html>
      <html lang="en">
        ${this.createHead(title, ['/static/styles.css'], [], backlink ? backlink.href : '/', metadata)}
        <body>
          <div id="app">
            <div><a href="${backlink ? backlink.href : '/'}" class="nostyle">← ${
              backlink ? backlink.text : 'Home'
            }</a></div>
            <h1 class="h">${title}</h1>
            <p>${error}</p>
          </div>
        </body>
      </html> `;
  }
}
