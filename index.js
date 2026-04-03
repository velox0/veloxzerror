require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets from the public/static directory
app.use("/static", express.static(path.join(__dirname, "public/static")));

// Serve favicon
app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "favicon.ico"));
});

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/art", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "art.html"));
});

app.get("/art/:key", (req, res) => {
  const key = req.params.key.replace(/[^a-zA-Z0-9-]/g, "");
  const filePath = path.join(__dirname, "public", "art", `${key}.html`);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("This page does not exist yet!");
    }
  });
});

app.get("/projects", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "projects.html"));
});

// GitHub API proxy endpoint — keeps the API key server-side
let cachedRepos = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

app.get("/api/projects", async (req, res) => {
  try {
    const now = Date.now();
    if (cachedRepos && now - cacheTime < CACHE_TTL) {
      return res.json(cachedRepos);
    }

    const token = process.env.GITHUB_API_KEY;
    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "velox0-express",
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }

    const response = await fetch(
      "https://api.github.com/users/Velox0/repos?per_page=100&sort=pushed&direction=desc",
      { headers },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GitHub API error:", response.status, errorText);
      return res.status(response.status).json({ error: "GitHub API error" });
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

    res.json(filtered);
  } catch (err) {
    console.error("Error fetching GitHub repos:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Custom 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
