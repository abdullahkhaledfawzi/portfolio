/* ============================================================
   Portfolio logic — projects grid with embedded live demos,
   filters, demo modal, hero terminal, counters.
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ------------------------- project data ------------------------- */

const REPO = "https://github.com/abdullahkhaledfawzi";

const PROJECTS = [
  {
    n: "01",
    title: "🔥 Forum",
    desc: "A complete web forum built with <strong>zero npm dependencies</strong> — Node.js built-ins only. Register/login with scrypt-hashed passwords, HttpOnly cookie sessions (one active per user), posts & comments with 👍/👎 votes, category filters, WebSocket live updates, SQLite storage, Dockerized with a 20/20 passing test suite.",
    tags: ["Node.js", "WebSocket", "SQLite", "Docker", "node:test 20/20"],
    filters: ["server", "docker"],
    kind: "sim",
    kindLabel: "interactive demo — real app UI, simulated data",
    demo: "demos/forum/index.html",
    demoTitle: "🔥 Forum — interactive demo",
    repo: `${REPO}/forum`,
    media: "browser",
  },
  {
    n: "02",
    title: "🎸 Groupie Tracker",
    desc: "Go web app (standard library only) consuming a RESTful API — 52 artists with member lists and concert history, artist detail pages, <strong>live search</strong> over the API, and styled 400/404/405/500 error pages. Multi-stage Docker build included.",
    tags: ["Go", "REST API", "html/template", "Docker"],
    filters: ["go", "docker", "server"],
    kind: "sim",
    kindLabel: "live demo — original API data snapshot ⚡",
    demo: "demos/groupie-tracker/index.html",
    demoTitle: "🎸 Groupie Tracker — live demo",
    repo: `${REPO}/groupie-tracker`,
    media: "browser",
  },
  {
    n: "03",
    title: "🍊 clonernews",
    desc: "A fast Hacker News reader in vanilla HTML/CSS/JS — Top / New / Best / Jobs feeds, progressive comments (10 per step), <strong>live polling every 5 s</strong> with an unseen-items badge, plus request caching, batching and retry-with-backoff. No frameworks, no build step — real live data right now.",
    tags: ["JavaScript", "REST API", "Live data", "Caching"],
    filters: ["js", "server"],
    kind: "live",
    kindLabel: "live app — real Hacker News API ⚡",
    demo: "demos/clonernews/index.html",
    demoTitle: "🍊 clonernews — live reader",
    repo: `${REPO}/clonernews`,
    media: "browser",
  },
  {
    n: "04",
    title: "🐜 lem-in",
    desc: "Ant-colony pathfinding — <strong>Edmonds-Karp max-flow</strong> routes every ant from ##start to ##end through the colony in the fewest turns. Standard library only, plus a browser visualizer that replays the solution turn by turn. The demo feeds in real solver output.",
    tags: ["Go", "Graph theory", "Max-flow", "SVG"],
    filters: ["go"],
    kind: "sim",
    kindLabel: "solution visualizer — real solver output ▶",
    demo: "demos/lem-in/index.html",
    demoTitle: "🐜 lem-in — solution visualizer",
    repo: `${REPO}/lem-in`,
    media: "browser",
  },
  {
    n: "05",
    title: "🐱 net-cat · TCPChat",
    desc: "A Go TCP group-chat server replicating NetCat: welcome banner, up to 10 simultaneous clients, message broadcasting with timestamps, <strong>chat history replay</strong>, join/leave notifications, /name /room /rooms commands and a chat.log. Goroutines + sockets, standard library only.",
    tags: ["Go", "TCP sockets", "Goroutines", "Concurrency"],
    filters: ["go", "server"],
    kind: "sim",
    kindLabel: "terminal simulation — faithful session replay ▶",
    demo: "demos/net-cat/index.html",
    demoTitle: "🐱 net-cat — TCP chat simulation",
    repo: `${REPO}/net-cat`,
    media: "terminal",
  },
  {
    n: "06",
    title: "🔄 push-swap",
    desc: "A greedy stack-sorting algorithm with the full press-swap instruction set, plus a checker that verifies every sequence — <strong>1000 integers in ~13k operations</strong>, unit-tested in Go. The demo replays the exact checker-verified binary output on real case files.",
    tags: ["Go", "Greedy algorithm", "Unit tests", "CLI"],
    filters: ["go"],
    kind: "sim",
    kindLabel: "stack visualizer — checker-verified ops ▶",
    demo: "demos/push-swap/index.html",
    demoTitle: "🔄 push-swap — stack visualizer",
    repo: `${REPO}/push-swap`,
    media: "terminal",
  },
  {
    n: "07",
    title: "🦸 sortable",
    desc: "A vanilla-JS data table over 563 superheroes from the Superhero API — <strong>sortable columns</strong> (numeric vs text rules, missing values sink to bottom), debounced live search, windowed pagination, dark theme with sticky header. No frameworks, no build step.",
    tags: ["JavaScript", "UI design", "Pagination"],
    filters: ["js"],
    kind: "live",
    kindLabel: "live app — real API data ⚡",
    demo: "demos/sortable/index.html",
    demoTitle: "🦸 sortable — live table",
    repo: `${REPO}/sortable`,
    media: "browser",
  },
  {
    n: "08",
    title: "🧩 crosswordSolver",
    desc: "Backtracking crossword filler in vanilla JS: input validation first, automatic <strong>slot detection</strong> (horizontal/vertical), word placement with crossing-letter checks, clean backtracking and uniqueness pruning. The full unit suite passes 12/12 — and yes, the demo runs the real solver.",
    tags: ["JavaScript", "Backtracking", "Testing"],
    filters: ["js"],
    kind: "sim",
    kindLabel: "animated backtracking + real solver ▶",
    demo: "demos/crossword/index.html",
    demoTitle: "🧩 crosswordSolver — backtracking visualizer",
    repo: `${REPO}/crossword`,
    media: "browser",
  },
  {
    n: "09",
    title: "🚭 SmokeFree — Non-Smoker",
    desc: "A personal non-smoking journey site based on Allen Carr's method — <strong>bilingual AR/EN toggle</strong>, day counter, light/dark themes and hand-animated backgrounds. Vanilla JS, persistent stats in localStorage, zero build tooling.",
    tags: ["JavaScript", "i18n", "localStorage", "CSS animation"],
    filters: ["js"],
    kind: "sim",
    kindLabel: "live site — my own public project ⚡",
    demo: "demos/non-smoker/index.html",
    demoTitle: "🚭 SmokeFree — project site",
    repo: `${REPO}/Non-Smoker`,
    media: "browser",
  },
];

/* ------------------------- rendering ------------------------- */

const grid = $("#project-grid");

function mediaChrome(project) {
  const dots = '<span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>';
  if (project.media === "terminal") {
    return `<div class="media-chrome">${dots}<span class="url">bash — ${project.demo.replace("demos/", "")}</span></div>`;
  }
  const url = `abdullahkhaledfawzi.github.io/portfolio/${project.demo}`;
  return `<div class="media-chrome">${dots}<span class="url">${url}</span></div>`;
}

function cardHTML(p, idx) {
  const badgeCls = p.kind === "live" ? "media-badge badge-live" : "media-badge badge-sim";
  return `
  <article class="project-card" data-filters="${p.filters.join(" ")}" data-idx="${idx}">
    <div class="media" data-media="${idx}">
      ${mediaChrome(p)}
      <span class="${badgeCls}">${p.kindLabel}</span>
      <div class="iframe-loader">
        <div class="spinner"></div>
        <span>loading live demo…</span>
        <button class="iframe-load-btn" data-load="${idx}">▶&nbsp; Play the demo</button>
      </div>
      <iframe data-src="${p.demo}" title="${p.demoTitle}" loading="lazy" tabindex="-1"></iframe>
    </div>
    <div class="card-body">
      <div class="card-title-row">
        <h3>${p.title}</h3>
        <span class="pnum">${p.n}</span>
      </div>
      <p class="card-desc">${p.desc}</p>
      <div class="card-tags">
        ${p.tags.map((t, i) => `<span class="tag ${["", "t2", "t3"][i % 3]}">${t}</span>`).join("")}
      </div>
      <div class="card-actions">
        <button class="btn btn-primary" data-demo="${idx}">▶ Open full demo</button>
        <a class="btn" href="${p.repo}" target="_blank" rel="noopener">Source code ↗</a>
        <a class="card-link-icon" href="${p.repo}" target="_blank" rel="noopener" aria-label="Go to the GitHub repository">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2 0 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6.1-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.3 2.8.1 3.2.8.8 1.3 1.9 1.3 3.1 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg>
        </a>
      </div>
    </div>
  </article>`;
}

grid.innerHTML = PROJECTS.map(cardHTML).join("");

/* --------- lazy iframe loading (IntersectionObserver) --------- */

const IO = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const box = entry.target;
      const slot = box.dataset.media;
      if (box.dataset.armed) continue;
      IO.unobserve(box);

      const armedDiv = box;
      armedDiv.dataset.armed = "1";
      const frame = box.querySelector("iframe");
      const loader = box.querySelector(".media .iframe-loader span");

      loader.textContent = "starting demo…";
      frame.src = frame.dataset.src;
      // the frames only render when visible — which keeps the CPU happy
      box.addEventListener("load", () => box.classList.add("iframe-ready"), { capture: true, once: false });
    }
  },
  { rootMargin: "480px 0px" }
);

$$(".media").forEach((m) => IO.observe(m));

/* manual play buttons (arm without waiting for scroll) */
document.addEventListener("click", (e) => {
  const play = e.target.closest("[data-load]");
  if (play) {
    const box = $(`.media[data-media="${play.dataset.load}"]`);
    if (box && !box.dataset.armed) {
      box.dataset.armed = "1";
      const frame = box.querySelector("iframe");
      frame.src = box.querySelector("iframe").dataset.src;
    }
  }
});

/* ------------------------- filters ------------------------- */

$("#filter-bar").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  $$(".filter-btn").forEach((b) => b.classList.toggle("active", b === btn));
  const f = btn.dataset.filter;
  $$(".project-card").forEach((card) => {
    card.classList.toggle(
      "hidden",
      f !== "all" && !card.dataset.filters.split(" ").includes(f)
    );
  });
});

/* ------------------------- demo modal ------------------------- */

const modal = $("#demo-modal");
const modalFrame = $("#modal-frame");
const modalTitle = $("#modal-title");
const modalOpen = $("#modal-open");
let lastFocus = null;

function openModal(idx) {
  const p = PROJECTS[idx];
  lastFocus = document.activeElement;
  modalTitle.textContent = p.demoTitle;
  modalOpen.href = p.demo;
  modalFrame.src = p.demo;
  modal.classList.add("open");
  document.body.classList.add("modal-open");
  modal.setAttribute("aria-hidden", "false");
  $(".modal-shell .modal-bar .btn-sm:last-child").focus();
}
function closeModal() {
  modal.classList.remove("open");
  document.body.classList.remove("modal-open");
  modal.setAttribute("aria-hidden", "true");
  modalFrame.src = "about:blank";
  if (lastFocus) lastFocus.focus();
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-demo]");
  if (t) openModal(Number(t.dataset.demo));
  if (e.target.closest("[data-close]")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
});

/* ------------------------- hero terminal ------------------------- */

const termEl = $("#hero-term");
const SCRIPT = [
  { t: "promo", out: "$ whoami" },
  { t: "type", out: "abdullah-khaled — backend & full-stack dev (Cairo)" },
  { t: "out" },
  { t: "promo", out: "$ cat stack.txt" },
  { t: "type", out: "Go · Node.js · Docker · Linux · Git · REST APIs" },
  { t: "out" },
  { t: "promo", out: "$ ./TCPChat 8989 &   # my TCP chat server" },
  { t: "delay", ms: 500 },
  { t: "type", out: "Listening on the port :8989. — goroutines ready ✓" },
  { t: "out" },
  { t: "promo", out: "$ git log --oneline -1" },
  { t: "type", out: "c0ffee1 feat: shipped another zero-dependency project" },
  { t: "pause", ms: 1500 },
];

async function typeLine(line) {
  const span = document.createElement("span");
  span.className = "tw";
  termEl.appendChild(span);
  const cursor = document.createElement("span");
  cursor.className = "term-cursor";
  termEl.appendChild(cursor);
  for (const ch of line) {
    span.textContent += ch;
    await new Promise((r) => setTimeout(r, 18));
  }
  await new Promise((r) => setTimeout(r, 240));
  cursor.remove();
  span.insertAdjacentText("afterend", "\n");
}

async function runHeroTerm() {
  termEl.innerHTML = "";
  while (termEl.isConnected) {
    for (const step of SCRIPT) {
      if (!termEl.isConnected) return;
      if (step.t === "promo") {
        const p = document.createElement("span");
        p.className = "tp";
        p.textContent = "➜  ~/ ";
        termEl.appendChild(p);
        await typeLine(step.out);
      } else if (step.t === "delay") {
        await new Promise((r) => setTimeout(r, step.ms));
      } else if (step.t === "pause") {
        await new Promise((r) => setTimeout(r, step.ms));
      }
    }
    await new Promise((r) => setTimeout(r, 800));
    termEl.innerHTML = "";
  }
}
runHeroTerm();

/* ------------------------- marquee ------------------------- */

const SKILLS_MARQUEE = [
  "Go — goroutines",
  "HTTP servers",
  "Node.js — zero npm deps",
  "REST APIs",
  "Docker multi-stage builds",
  "Linux shell scripting",
  "Git / GitHub",
  "SQLite",
  "WebSocket live servers",
  "server-side rendering",
  "concurrency & channels",
  "TDD",
  "algorithms & data structures",
  "vanilla JS UIs",
];

const track = $("#marquee");
const chunk = SKILLS_MARQUEE.map((s) => `<span>${s}</span>`).join("");
track.innerHTML = chunk + chunk;

/* ------------------------- counters ------------------------- */

const counters = $$(".stat-num");
const io2 = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io2.unobserve(en.target);
      const target = Number(en.target.dataset.count);
      const start = performance.now();
      const dur = 900;
      const tick = (t) => {
        const pr = Math.min(1, (t - start) / dur);
        en.target.textContent = Math.round(target * pr);
        if (pr < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  },
  { threshold: 0.4 }
);
counters.forEach((c) => io2.observe(c));

/* ------------------------- nav ------------------------- */

const navToggle = $("#nav-toggle");
navToggle.addEventListener("click", () => {
  const links = document.querySelector(".nav-links");
  const open = links.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.textContent = open ? "✕" : "☰";
});
$$(".nav-links a").forEach((a) =>
  a.addEventListener("click", () => {
    document.querySelector(".nav-links").classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.textContent = "☰";
  })
);

$("#year").textContent = new Date().getFullYear();
