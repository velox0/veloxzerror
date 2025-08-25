import { Injectable } from '@nestjs/common';
import { CreatePageService } from 'src/create-page/create-page.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class ProjectsService {
    GITHUB_API_KEY: string;
    do_not_list: string[];
    constructor(private readonly createPageService: CreatePageService) {
        this.GITHUB_API_KEY = process.env.GITHUB_API_KEY || "";
        this.do_not_list = [
            "Velox0",
            "Anime-Girls-Holding-Programming-Books"
        ]
        console.log("GITHUB_API_KEY", this.GITHUB_API_KEY);
    }

    private async getProjects(): Promise<any> {
        const response = await fetch(`https://api.github.com/users/velox0/repos`, {
            headers: {
                'Authorization': `Bearer ${this.GITHUB_API_KEY}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        let data = await response.json();
        // sort projects by updated_at
        data.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        // remove do_not_list
        data = data.filter((project: any) => !this.do_not_list.includes(project.name));

        return data.map((project: any) => {
            return {
                name: project.full_name,
                description: project.description,
                url: project.html_url,
                language: project.language,
                homepage: project.homepage,
                lastpush: project.pushed_at,
            }
        });
    }

    private ifNotNull(value: any, className: string, style: string, type: string = "div", href: string = ""): string {
        if (href == "")
            return value ? `<${type} class="${className}" style="${style}">${value}</${type}>` : "";
        else
            return value ? `<a class="${className}" style="${style}" href="${href}">[${value}]</a>` : "";
    }

    private formatLastPushed(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        if (diffInMinutes < 1) {
            return 'just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else if (diffInDays < 30) {
            const weeks = Math.floor(diffInDays / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else if (diffInDays < 365) {
            const months = Math.floor(diffInDays / 30);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        } else {
            const years = Math.floor(diffInDays / 365);
            return `${years} year${years > 1 ? 's' : ''} ago`;
        }
    }

    async getProjectsPage(): Promise<any> {
        const projects = await this.getProjects();
        return this.createPageService.createPage(
            "Projects - Velox0",
            `
            <div><a href="/" class="nostyle">← Home</a></div>
            <h1 class='h'>Projects</h1>
            <div class="projects-container" style="width: 100%; display: flex; flex-direction: column; align-items: left; justify-content: center;">` +
            projects.map((project: any) => `<a href="${project.url}" class="nostyle"><div class="project-card">
            <div class="project-card-name">{ ${project.name}</div><hr />
            ${this.ifNotNull(project.homepage, "", "font-size:12px; line-height: 32px;", "", project.homepage)}
            ${this.ifNotNull(project.description, "project-card-description", "font-size: 12px; color: var(--color-text);")}
            <span style="color:var(--color-text); font-size: small; opacity: 0.7;">last pushed: ${this.formatLastPushed(project.lastpush)}</span><br />
            ${this.ifNotNull(project.language, "project-card-language", "font-size: 12px;", "span")}
            }</div></a>`).join("\n") +
            `</div>`,
            ["/static/styles.css", "/static/projects.css"],
            [],
            "https://velox0.com/projects", [
            { property: "og:title", content: "Velox0's Projects" },
            { property: "og:description", content: "A collection of my projects from GitHub — mostly backend tools and microservices." },
            { property: "og:url", content: "https://velox0.com/projects" },
            { property: "og:type", content: "website" },
        ], "A collection of my projects from GitHub — mostly backend tools and microservices.",
            ["velox0", "github", "projects", "code", "programming", "software", "development"]);
    }
}
