(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const CACHE_KEY = "velox-resume-commits-v1";
  const CACHE_TTL = 5 * 60 * 1000;
  const PAGE_SIZE = 100;
  const DISPLAY_SIZE = 12;
  const state = { commits: [], page: 0, total: 0, savedAt: 0, incomplete: false, loading: false, retryAt: 0, visible: DISPLAY_SIZE, day: "", skill: "" };
  const projects = Array.from(document.querySelectorAll(".project"));
  const skillButtons = Array.from(document.querySelectorAll("[data-skill]"));
  const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
  const relativeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  let toastTimer;

  function notify(message) {
    clearTimeout(toastTimer);
    $("toast").textContent = message;
    $("toast").hidden = false;
    toastTimer = setTimeout(() => { $("toast").hidden = true; }, 3500);
  }

  function applyTheme(dark) {
    document.documentElement.dataset.theme = dark ? "dark" : "paper";
    $("theme-toggle").setAttribute("aria-pressed", String(dark));
    $("theme-toggle").textContent = dark ? "Paper mode" : "Dark mode";
  }
  try { applyTheme(localStorage.getItem("velox-resume-theme") === "dark"); } catch (_) { /* Storage is optional. */ }
  $("theme-toggle").addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme !== "dark";
    applyTheme(dark);
    try { localStorage.setItem("velox-resume-theme", dark ? "dark" : "paper"); } catch (_) { /* Storage is optional. */ }
  });
  $("print-resume").addEventListener("click", () => window.print());
  let prePrintOrder;
  window.addEventListener("beforeprint", () => {
    prePrintOrder = Array.from($("project-list").children);
    $("project-list").append(...projects);
  });
  window.addEventListener("afterprint", () => {
    if (prePrintOrder) $("project-list").append(...prePrintOrder);
  });

  function setExpanded(project, expanded) {
    const toggle = project.querySelector(".project-toggle");
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.querySelector(".disclosure").textContent = expanded ? "−" : "+";
    $(toggle.getAttribute("aria-controls")).hidden = !expanded;
  }
  function updateExpandLabel() {
    const visible = projects.filter((project) => !project.hidden);
    $("toggle-projects").textContent = visible.some((project) => project.querySelector(".project-details").hidden) ? "Expand all" : "Collapse all";
    $("toggle-projects").disabled = !visible.length;
  }
  projects.forEach((project) => {
    project.querySelector(".project-toggle").addEventListener("click", () => {
      setExpanded(project, project.querySelector(".project-details").hidden);
      updateExpandLabel();
    });
  });
  $("toggle-projects").addEventListener("click", () => {
    const visible = projects.filter((project) => !project.hidden);
    const expand = visible.some((project) => project.querySelector(".project-details").hidden);
    visible.forEach((project) => setExpanded(project, expand));
    updateExpandLabel();
  });

  function projectStats(repo) {
    const commits = state.commits.filter((commit) => commit.repo.toLowerCase() === repo);
    return { count: commits.length, latest: Math.max(0, ...commits.map((commit) => Date.parse(commit.date))) };
  }
  function renderProjects() {
    const query = $("project-search").value.trim().toLowerCase();
    const sort = $("project-sort").value;
    const ordered = projects.slice();
    if (sort === "name") ordered.sort((a, b) => a.querySelector("strong").textContent.localeCompare(b.querySelector("strong").textContent));
    if (sort === "activity" || sort === "commits") {
      const key = sort === "activity" ? "latest" : "count";
      ordered.sort((a, b) => projectStats(b.dataset.repo)[key] - projectStats(a.dataset.repo)[key]);
    }
    let count = 0;
    ordered.forEach((project) => {
      const hasSkill = !state.skill || project.dataset.skills.split(",").includes(state.skill);
      project.hidden = !hasSkill || !`${project.textContent} ${project.dataset.skills}`.toLowerCase().includes(query);
      if (!project.hidden) count++;
    });
    $("project-list").append(...ordered);
    skillButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.skill === state.skill)));
    $("project-feedback").hidden = !query && !state.skill && sort === "featured";
    $("project-count").textContent = `${count} of ${projects.length} projects${state.skill ? ` · ${state.skill}` : ""}${sort === "activity" || sort === "commits" ? " · based on loaded commits" : ""}`;
    $("projects-empty").hidden = count !== 0;
    updateExpandLabel();
  }
  skillButtons.forEach((button) => button.addEventListener("click", () => {
    state.skill = state.skill === button.dataset.skill ? "" : button.dataset.skill;
    renderProjects();
    $("projects").scrollIntoView({ block: "start" });
  }));
  $("project-search").addEventListener("input", renderProjects);
  $("project-sort").addEventListener("change", renderProjects);
  $("clear-projects").addEventListener("click", () => {
    state.skill = "";
    $("project-search").value = "";
    $("project-sort").value = "featured";
    renderProjects();
  });

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function button(className, text, callback) {
    const node = element("button", className, text);
    node.type = "button";
    node.addEventListener("click", callback);
    return node;
  }
  function relativeTime(date) {
    const seconds = Math.min(0, Math.round((Date.parse(date) - Date.now()) / 1000));
    if (seconds > -60) return "just now";
    for (const [unit, length] of [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]]) {
      if (Math.abs(seconds) >= length) return relativeFormat.format(Math.ceil(seconds / length), unit);
    }
    return "just now";
  }

  // Validate cached and remote fields; all external text is rendered with textContent.
  function validCommit(commit) {
    return commit && /^[a-f0-9]{40,64}$/i.test(commit.sha) && /^[a-z0-9-]+\/[a-z0-9_.-]+$/i.test(commit.repo) && typeof commit.message === "string" && typeof commit.date === "string" && Number.isFinite(Date.parse(commit.date));
  }
  function normalizeCommit(item) {
    const commit = {
      sha: item?.sha,
      repo: item?.repository?.full_name,
      message: item?.commit?.message,
      date: item?.commit?.committer?.date || item?.commit?.author?.date,
    };
    return validCommit(commit) ? commit : null;
  }
  function status(message, error = false) {
    $("feed-status").textContent = message;
    $("feed-status").hidden = !message;
    $("feed-status").dataset.error = String(error);
  }
  function updateRepoOptions() {
    const selected = $("commit-repo").value;
    const repos = new Set(state.commits.map((commit) => commit.repo.toLowerCase()));
    if (selected) repos.add(selected);
    $("commit-repo").replaceChildren(new Option("All repositories", ""), ...Array.from(repos).sort().map((repo) => new Option(repo, repo)));
    $("commit-repo").value = selected;
  }
  function selectRepo(repo) {
    const value = repo.toLowerCase();
    if (!Array.from($("commit-repo").options).some((option) => option.value === value)) $("commit-repo").add(new Option(value, value));
    $("commit-repo").value = value;
    $("commit-search").value = "";
    $("commit-period").value = "all";
    state.day = "";
    applyCommitFilters();
  }
  document.querySelectorAll(".project-activity").forEach((node) => node.addEventListener("click", () => {
    selectRepo(node.dataset.repo);
    $("activity").scrollIntoView({ block: "start" });
  }));

  function filteredCommits() {
    const query = $("commit-search").value.trim().toLowerCase();
    const repo = $("commit-repo").value;
    const period = $("commit-period").value;
    const since = period === "all" ? 0 : Date.now() - Number(period) * 86400000;
    const filtered = state.commits.filter((commit) =>
      (!repo || commit.repo.toLowerCase() === repo) && Date.parse(commit.date) >= since &&
      (!state.day || new Date(commit.date).toISOString().slice(0, 10) === state.day) &&
      `${commit.message} ${commit.repo} ${commit.sha}`.toLowerCase().includes(query));
    const sort = $("commit-sort").value;
    filtered.sort((a, b) => {
      if (sort === "repo") return a.repo.localeCompare(b.repo) || Date.parse(b.date) - Date.parse(a.date);
      if (sort === "message") return a.message.localeCompare(b.message) || Date.parse(b.date) - Date.parse(a.date);
      return sort === "oldest" ? Date.parse(a.date) - Date.parse(b.date) : Date.parse(b.date) - Date.parse(a.date);
    });
    return filtered;
  }
  function renderCommits() {
    const filtered = filteredCommits();
    const shown = filtered.slice(0, state.visible);
    const hasFilters = $("commit-search").value.trim() || $("commit-repo").value || $("commit-period").value !== "all" || state.day || $("commit-sort").value !== "newest";
    $("clear-commits").hidden = !hasFilters;
    $("commit-count").textContent = `${shown.length} of ${filtered.length} matching · ${state.commits.length} loaded${state.day ? ` · ${state.day} (UTC)` : ""}`;
    const fragment = document.createDocumentFragment();
    for (const commit of shown) {
      const row = element("article", "commit-row");
      const top = element("div", "commit-topline");
      const repository = button("commit-repository", commit.repo, () => selectRepo(commit.repo));
      repository.title = `Filter to ${commit.repo}`;
      const time = element("time", "", relativeTime(commit.date));
      time.dateTime = commit.date;
      time.title = new Date(commit.date).toLocaleString();
      top.append(repository, time);
      const [title, ...body] = commit.message.split("\n");
      const link = element("a", "commit-message", title || "Update repository");
      link.href = `https://github.com/${commit.repo}/commit/${commit.sha}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const bottom = element("div", "commit-bottom");
      const copy = button("copy-sha", commit.sha.slice(0, 7), async () => {
        try {
          await navigator.clipboard.writeText(commit.sha);
          notify("Commit SHA copied.");
        } catch (_) {
          notify("Copy unavailable in this browser. Open the commit to copy its SHA.");
        }
      });
      copy.title = "Copy full commit SHA";
      copy.setAttribute("aria-label", `Copy commit SHA ${commit.sha.slice(0, 7)}`);
      bottom.append(copy, element("span", "", dateFormat.format(new Date(commit.date))));
      row.append(top, link, bottom);
      if (body.join("\n").trim()) {
        const details = element("details", "commit-body");
        details.append(element("summary", "", "Read full message"), element("p", "", body.join("\n").trim()));
        row.append(details);
      }
      fragment.append(row);
    }
    if (!shown.length && !state.loading) {
      fragment.append(element("p", "empty-state", state.commits.length ? "No matching commits in the loaded history. Clear filters or load older commits." : "No commits to display yet. Refresh to try again, or explore the full history on GitHub."));
    }
    $("commit-list").replaceChildren(fragment);
    $("show-more").hidden = filtered.length <= state.visible;
    $("load-older").hidden = !state.page || state.page * PAGE_SIZE >= Math.min(state.total, 1000);
    $("load-older").disabled = state.loading;
    $("load-older").textContent = state.loading ? "Loading…" : "Load older from GitHub ↓";
  }

  function renderChart() {
    $("activity-summary").hidden = !state.commits.length;
    $("stat-commits").textContent = state.commits.length;
    $("stat-repos").textContent = new Set(state.commits.map((commit) => commit.repo.toLowerCase())).size;
    const counts = new Map();
    state.commits.forEach((commit) => {
      const day = new Date(commit.date).toISOString().slice(0, 10);
      counts.set(day, (counts.get(day) || 0) + 1);
    });
    $("stat-days").textContent = counts.size;
    const days = Array.from({ length: 56 }, (_, index) => {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - 55 + index);
      const day = date.toISOString().slice(0, 10);
      return { day, count: counts.get(day) || 0 };
    });
    const max = Math.max(1, ...days.map(({ count }) => count));
    $("activity-chart").replaceChildren(...days.map(({ day, count }) => {
      const bar = button("activity-day", undefined, () => {
        state.day = state.day === day ? "" : day;
        $("commit-period").value = "all";
        applyCommitFilters();
      });
      const label = `${day}: ${count} loaded commit${count === 1 ? "" : "s"}`;
      bar.title = label;
      bar.setAttribute("aria-label", label);
      bar.setAttribute("aria-pressed", String(state.day === day));
      bar.dataset.day = day;
      bar.dataset.empty = String(count === 0);
      const fill = element("span");
      fill.style.height = `${Math.max(6, count / max * 100)}%`;
      bar.append(fill);
      return bar;
    }));
  }
  function applyCommitFilters() {
    state.visible = DISPLAY_SIZE;
    renderCommits();
    document.querySelectorAll(".activity-day").forEach((bar) => bar.setAttribute("aria-pressed", String(state.day === bar.dataset.day)));
  }
  ["commit-search", "commit-repo", "commit-period", "commit-sort"].forEach((id) => {
    $(id).addEventListener(id === "commit-search" ? "input" : "change", () => {
      if (id === "commit-period") state.day = "";
      applyCommitFilters();
    });
  });
  $("clear-commits").addEventListener("click", () => {
    $("commit-search").value = "";
    $("commit-repo").value = "";
    $("commit-period").value = "all";
    $("commit-sort").value = "newest";
    state.day = "";
    applyCommitFilters();
  });
  $("show-more").addEventListener("click", () => { state.visible += DISPLAY_SIZE; renderCommits(); });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey || event.target.closest("input, textarea, select, [contenteditable]")) return;
    event.preventDefault();
    $("commit-search").focus();
  });

  function renderData() {
    updateRepoOptions();
    renderChart();
    renderCommits();
    renderProjects();
  }
  function saveCache() {
    const { commits, page, total, savedAt, incomplete } = state;
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ commits, page, total, savedAt, incomplete })); } catch (_) { /* Private mode and quota failures must not break the feed. */ }
  }
  function restoreCache() {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (!cached || !Array.isArray(cached.commits) || !cached.commits.every(validCommit) || !Number.isInteger(cached.page) || cached.page < 1 || cached.page > 10 || !Number.isFinite(cached.savedAt) || cached.savedAt > Date.now() || !Number.isFinite(cached.total) || cached.total < 0) return false;
      Object.assign(state, { commits: cached.commits.slice(0, 1000), page: cached.page, total: cached.total, savedAt: cached.savedAt, incomplete: Boolean(cached.incomplete) });
      return true;
    } catch (_) { return false; }
  }
  async function loadCommits(append = false) {
    if (state.loading) return;
    if (Date.now() < state.retryAt) {
      status(`Please retry after ${new Date(state.retryAt).toLocaleTimeString()}.${state.commits.length ? " Loaded commits are still available." : ""}`, true);
      return;
    }
    state.loading = true;
    $("refresh-commits").disabled = true;
    $("commit-list").setAttribute("aria-busy", "true");
    status(append ? "Loading older commits from GitHub…" : state.commits.length ? "Refreshing from GitHub. Your loaded commits remain available." : "Connecting to GitHub…");
    renderCommits();
    const page = append ? state.page + 1 : 1;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      // Public GitHub API, browser-only. No proxy, server hydration, or token.
      // https://docs.github.com/en/rest/search/search#search-commits
      const params = new URLSearchParams({ q: "author:velox0", sort: "committer-date", order: "desc", per_page: String(PAGE_SIZE), page: String(page) });
      const response = await fetch(`https://api.github.com/search/commits?${params}`, {
        headers: { Accept: "application/vnd.github+json" },
        credentials: "omit",
        signal: controller.signal,
      });
      if (response.status === 403 || response.status === 429) {
        const reset = Number(response.headers.get("x-ratelimit-reset")) * 1000;
        const retry = Number(response.headers.get("retry-after")) * 1000;
        state.retryAt = Math.max(Date.now() + 60000, Number.isFinite(reset) ? reset : 0, Date.now() + (Number.isFinite(retry) ? retry : 0));
        throw new Error(`GitHub is limiting requests. Retry after ${new Date(state.retryAt).toLocaleTimeString()}.`);
      }
      if (!response.ok) throw new Error(`GitHub returned ${response.status}. Please try again shortly.`);
      const data = await response.json();
      if (!Array.isArray(data.items) || !Number.isFinite(data.total_count)) throw new Error("GitHub returned an unexpected response. Please try again.");
      const incoming = data.items.map(normalizeCommit).filter(Boolean);
      const unique = new Map((append ? state.commits : []).map((commit) => [`${commit.repo.toLowerCase()}:${commit.sha}`, commit]));
      incoming.forEach((commit) => unique.set(`${commit.repo.toLowerCase()}:${commit.sha}`, commit));
      state.commits = Array.from(unique.values());
      state.page = page;
      state.total = data.items.length < PAGE_SIZE ? (page - 1) * PAGE_SIZE + data.items.length : data.total_count;
      state.savedAt = Date.now();
      state.incomplete = Boolean(data.incomplete_results);
      if (!append) state.visible = DISPLAY_SIZE;
      saveCache();
      status(state.incomplete ? "GitHub returned partial results. Refresh later for a more complete history." : `Updated ${new Date(state.savedAt).toLocaleTimeString()} · fetched directly from GitHub.`);
      state.retryAt = Date.now() + 6500;
    } catch (error) {
      let message = error.name === "AbortError" ? "GitHub took too long to respond. Please try again." : error instanceof TypeError ? "Could not connect to GitHub. Check your connection and refresh." : error.message;
      if (state.commits.length) message += ` Showing saved commits from ${new Date(state.savedAt).toLocaleString()}.`;
      status(message, true);
    } finally {
      clearTimeout(timeout);
      state.loading = false;
      $("refresh-commits").disabled = false;
      $("commit-list").setAttribute("aria-busy", "false");
      renderData();
    }
  }
  $("refresh-commits").addEventListener("click", () => loadCommits());
  $("load-older").addEventListener("click", () => loadCommits(true));

  let scrollPending = false;
  const sections = Array.from(document.querySelectorAll("main > section"));
  function updateReadingPosition() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    $("reading-progress").style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    const current = sections.filter((section) => section.getBoundingClientRect().top <= 170).at(-1) || sections[0];
    document.querySelectorAll(".section-nav a").forEach((link) => {
      if (link.hash === `#${current.id}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    scrollPending = false;
  }
  window.addEventListener("scroll", () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateReadingPosition); }
  }, { passive: true });
  window.addEventListener("resize", updateReadingPosition);
  updateReadingPosition();
  renderProjects();
  if (restoreCache()) {
    renderData();
    $("commit-list").setAttribute("aria-busy", "false");
    if (Date.now() - state.savedAt < CACHE_TTL) {
      status(`Saved ${new Date(state.savedAt).toLocaleTimeString()} · cached in this browser.${state.incomplete ? " GitHub returned partial results; refresh to try again." : ""}`);
    } else loadCommits();
  } else loadCommits();
})();
