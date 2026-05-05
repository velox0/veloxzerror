require("dotenv").config();
const fastify = require("fastify")({logger: false});
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 3000;

// Main static files root, allows us to use reply.sendFile("index.html") which looks in "public"
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/public_hidden/", // just to avoid namespace clash
  decorateReply: true,
});

// Serve static assets from public/static under the /static/ route
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public", "static"),
  prefix: "/static/",
  decorateReply: false,
});

// Routes
fastify.get("/favicon.ico", (req, res) => {
  return res.sendFile("favicon.ico");
});

fastify.get("/", (req, res) => {
  return res.sendFile("index.html");
});

fastify.get("/art", (req, res) => {
  return res.sendFile("art.html");
});

fastify.get("/art/:key", (req, res) => {
  const key = req.params.key.replace(/[^a-zA-Z0-9-]/g, "");
  const filePath = path.join(__dirname, "public", "art", `${key}.html`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("This page does not exist yet!");
  }
  return res.sendFile(`art/${key}.html`);
});

fastify.get("/projects", (req, res) => {
  return res.sendFile("projects.html");
});

// GitHub API proxy
let cachedRepos = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

fastify.get("/api/projects", async (req, res) => {
  try {
    const now = Date.now();
    if (cachedRepos && now - cacheTime < CACHE_TTL) {
      return cachedRepos;
    }

    const token = process.env.GITHUB_API_KEY;
    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "velox0-fastify",
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }

    const response = await fetch(
      "https://api.github.com/users/Velox0/repos?per_page=100&sort=pushed&direction=desc",
        {headers},
    );

    if (!response.ok) {
      const errorText = await response.text();
      req.log.error(`GitHub API error: ${response.status} ${errorText}`);
      return res.status(response.status).send({ error: "GitHub API error" });
    }

    const repos = await response.json();

    // Starred repos (matching live site)
    const STARRED_REPOS = ["moonlight-server", "embed0", "creeper"];

    // Filter out profile README repo & return only needed fields
    const filtered = repos
      .filter((r) => r.name !== r.owner.login)
      .map((r) => ({
        full_name: r.full_name,
        html_url: r.html_url,
        description: r.description,
        homepage: r.homepage || null,
        language: r.language,
        pushed_at: r.pushed_at,
        default_branch: r.default_branch,
        starred: STARRED_REPOS.includes(r.name),
      }));

    cachedRepos = filtered;
    cacheTime = now;

    return filtered;
  } catch (err) {
    req.log.error(`Error fetching GitHub repos: ${err}`);
    return res.status(500).send({ error: "Internal server error" });
  }
});

// Custom 404 handler
fastify.setNotFoundHandler((req, res) => {
  return res.status(404).sendFile("404.html");
});

const start = async () => {
  try {
    await fastify.listen({port: PORT, host: "0.0.0.0"});
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
