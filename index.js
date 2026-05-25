require("dotenv").config();
const fastify = require("fastify")({ logger: false });
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 3000;
const STARRED_REPOS = ["moonlight-server", "kraken", "cerver", "creeper"];
const HIDDEN_REPOS = ["velox0", "veloxzerror"];
const PINNED_REPOS = ["cerver"];

// Main static files root, allows us to use reply.sendFile("index.html") which looks in "public"
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  serve: false,
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

// GitHub API proxy — disk-persisted cache survives restarts
const CACHE_FILE = path.join(__dirname, "cache", "projects.json");
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const MARKED_CACHE_FILE = path.join(__dirname, "cache", "marked.min.js");

// Pre-fetch marked.js on startup
(async function initMarkedCache() {
  try {
    if (!fs.existsSync(MARKED_CACHE_FILE)) {
      console.log("[cache] Fetching marked.js from CDN...");
      const res = await fetch(
        "https://cdn.jsdelivr.net/npm/marked/marked.min.js",
      );
      if (res.ok) {
        const text = await res.text();
        fs.mkdirSync(path.dirname(MARKED_CACHE_FILE), { recursive: true });
        fs.writeFileSync(MARKED_CACHE_FILE, text);
        console.log("[cache] Saved marked.js to disk.");
      }
    }
  } catch (e) {
    console.warn("[cache] Failed to fetch marked.js:", e.message);
  }
})();

// Load cache from disk on startup so the first request is never cold
let cachedRepos = null;
let cacheTime = 0;
(function loadDiskCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf8");
      const { data, savedAt } = JSON.parse(raw);
      cachedRepos = data;
      cacheTime = savedAt;
      console.log(
        `[cache] Loaded ${data.length} repos from disk (age: ${Math.round((Date.now() - savedAt) / 1000)}s)`,
      );
    }
  } catch (e) {
    console.warn("[cache] Failed to load disk cache:", e.message);
  }
})();

async function fetchAndCacheRepos() {
  const token = process.env.GITHUB_API_KEY;
  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "velox0-fastify",
  };
  if (token) headers["Authorization"] = `token ${token}`;

  const response = await fetch(
    "https://api.github.com/users/Velox0/repos?per_page=100&sort=pushed&direction=desc",
    { headers },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API ${response.status}: ${errorText}`);
  }

  const repos = await response.json();

  const filtered = repos
    .filter((r) => r.name !== r.owner.login && !HIDDEN_REPOS.includes(r.name))
    .map((r) => ({
      full_name: r.full_name,
      html_url: r.html_url,
      description: r.description,
      homepage: r.homepage || null,
      language: r.language,
      pushed_at: r.pushed_at,
      default_branch: r.default_branch,
      starred: STARRED_REPOS.includes(r.name),
      pinned: PINNED_REPOS.includes(r.name),
    }))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (b.pinned && !a.pinned) return 1;
      if (a.starred && !b.starred) return -1;
      if (b.starred && !a.starred) return 1;
      return new Date(b.pushed_at) - new Date(a.pushed_at);
    })
    .map(({ pinned, ...rest }) => rest);

  const now = Date.now();
  cachedRepos = filtered;
  cacheTime = now;

  // Persist to disk (non-blocking)
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(
    CACHE_FILE,
    JSON.stringify({ data: filtered, savedAt: now }),
  );

  return filtered;
}

const RECENT_COMMITS_CACHE_FILE = path.join(
  __dirname,
  "cache",
  "recent-commits.json",
);
const RECENT_COMMITS_TTL = 15 * 60 * 1000;

let cachedRecentCommits = null;
let recentCommitsCacheTime = 0;
(function loadDiskRecentCommitsCache() {
  try {
    if (fs.existsSync(RECENT_COMMITS_CACHE_FILE)) {
      const raw = fs.readFileSync(RECENT_COMMITS_CACHE_FILE, "utf8");
      const { data, savedAt } = JSON.parse(raw);
      cachedRecentCommits = data;
      recentCommitsCacheTime = savedAt;
    }
  } catch (e) {
    console.warn("[cache] Failed to load recent commits cache:", e.message);
  }
})();

function buildHeaders(token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "velox0-fastify",
  };

  if (token) headers.Authorization = `token ${token}`;
  return headers;
}

function summarizeWorkflowRuns(workflowRuns) {
  const counts = new Map();

  for (const run of workflowRuns) {
    const label = run.conclusion || run.status || "unknown";
    counts.set(label, (counts.get(label) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, count]) => `${count} ${label}`)
    .join(" · ");
}

async function fetchRecentCommits() {
  const token = process.env.GITHUB_API_KEY;
  const headers = buildHeaders(token);
  const repos =
    cachedRepos && Date.now() - cacheTime < CACHE_TTL
      ? cachedRepos
      : await fetchAndCacheRepos();

  const recentCommits = await Promise.all(
    repos.map(async (repo) => {
      try {
        const branch = encodeURIComponent(repo.default_branch || "main");
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?sha=${branch}&per_page=5`,
          { headers },
        );

        if (!commitsResponse.ok) return null;

        const commits = await commitsResponse.json();
        if (!commits.length) return null;

        let latestCommitActions = null;
        try {
          const latestCommit = commits[0];
          const runsResponse = await fetch(
            `https://api.github.com/repos/${repo.full_name}/actions/runs?head_sha=${latestCommit.sha}&per_page=10`,
            { headers },
          );

          if (runsResponse.ok) {
            const runs = await runsResponse.json();
            if (runs.total_count > 0 && runs.workflow_runs?.length) {
              latestCommitActions = {
                count: runs.total_count,
                summary: summarizeWorkflowRuns(runs.workflow_runs.slice(0, 5)),
                url: runs.workflow_runs[0].html_url,
              };
            }
          }
        } catch (err) {
          console.warn(
            `[cache] Failed to fetch actions for ${repo.full_name}:`,
            err.message,
          );
        }

        return commits.map((commit, index) => ({
          repo: repo.full_name,
          repo_url: repo.html_url,
          commit_url: commit.html_url,
          sha: commit.sha,
          message:
            commit.commit?.message?.split("\n")[0] || "updated repository",
          committed_at:
            commit.commit?.committer?.date ||
            commit.commit?.author?.date ||
            repo.pushed_at,
          actions: index === 0 ? latestCommitActions : null,
        }));
      } catch (err) {
        console.warn(
          `[cache] Failed to fetch commit for ${repo.full_name}:`,
          err.message,
        );
        return null;
      }
    }),
  );

  return recentCommits
    .flatMap((repoCommits) => repoCommits || [])
    .sort((a, b) => new Date(b.committed_at) - new Date(a.committed_at));
}

fastify.get("/api/recent-commits", async (req, res) => {
  try {
    const now = Date.now();

    if (
      cachedRecentCommits &&
      now - recentCommitsCacheTime < RECENT_COMMITS_TTL
    ) {
      if (now - recentCommitsCacheTime > 10 * 60 * 1000) {
        fetchRecentCommits()
          .then((data) => {
            cachedRecentCommits = data;
            recentCommitsCacheTime = Date.now();
            fs.mkdirSync(path.dirname(RECENT_COMMITS_CACHE_FILE), {
              recursive: true,
            });
            fs.writeFileSync(
              RECENT_COMMITS_CACHE_FILE,
              JSON.stringify({ data, savedAt: recentCommitsCacheTime }),
            );
          })
          .catch((e) =>
            console.warn(
              "[cache] Background recent commits refresh failed:",
              e.message,
            ),
          );
      }

      return cachedRecentCommits;
    }

    const data = await fetchRecentCommits();
    cachedRecentCommits = data;
    recentCommitsCacheTime = now;

    fs.mkdirSync(path.dirname(RECENT_COMMITS_CACHE_FILE), { recursive: true });
    fs.writeFileSync(
      RECENT_COMMITS_CACHE_FILE,
      JSON.stringify({ data, savedAt: now }),
    );

    return data;
  } catch (err) {
    req.log.error(`Error fetching recent commits: ${err}`);
    if (cachedRecentCommits) {
      console.warn("[cache] Returning stale recent commits due to fetch error");
      return cachedRecentCommits;
    }
    return res.status(500).send({ error: "Internal server error" });
  }
});

fastify.get("/api/projects", async (req, res) => {
  try {
    const now = Date.now();

    if (cachedRepos && now - cacheTime < CACHE_TTL) {
      // Stale-while-revalidate: if cache is >20 min old, refresh in background
      if (now - cacheTime > 20 * 60 * 1000) {
        fetchAndCacheRepos().catch((e) =>
          console.warn("[cache] Background refresh failed:", e.message),
        );
      }
      return cachedRepos;
    }

    // Cache is empty or expired — fetch synchronously
    return await fetchAndCacheRepos();
  } catch (err) {
    req.log.error(`Error fetching GitHub repos: ${err}`);
    // Return stale data if available rather than erroring out
    if (cachedRepos) {
      console.warn("[cache] Returning stale data due to fetch error");
      return cachedRepos;
    }
    return res.status(500).send({ error: "Internal server error" });
  }
});

fastify.get("/api/marked.js", async (req, res) => {
  try {
    if (fs.existsSync(MARKED_CACHE_FILE)) {
      res.header("Content-Type", "application/javascript");
      res.header("Cache-Control", "public, max-age=604800"); // 7 days
      const content = fs.readFileSync(MARKED_CACHE_FILE, "utf8");
      return res.send(content);
    } else {
      return res.status(404).send("marked.js not found");
    }
  } catch (err) {
    req.log.error(`Error serving marked.js: ${err}`);
    return res.status(500).send("Internal server error");
  }
});

// Custom 404 handler
fastify.setNotFoundHandler((req, res) => {
  return res.status(404).sendFile("404.html");
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
