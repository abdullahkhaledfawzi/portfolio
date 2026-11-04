/* =============================================================================
   lem-in visualizer — demo edition.

   Same parser, layout, playback engine as the real visualizer
   (github.com/abdullahkhaledfawzi/lem-in) — here the printable output of the
   compiled binary on the shipped test maps is embedded (see solutions.js),
   so you can watch real solutions without running Go locally.
   ============================================================================= */

// ----------------------------- parsing --------------------------------------

function parseOutput(text) {
  const lines = text.split(/\r?\n/);

  const blank = lines.findIndex((l) => l.trim() === "");
  const farm = blank === -1 ? lines : lines.slice(0, blank);
  const moveLines = blank === -1 ? [] : lines.slice(blank + 1);

  let ants = 0;
  let start = null;
  let end = null;
  let pending = null;
  const rooms = new Map();
  const tunnels = [];

  for (const raw of farm) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) {
      if (line === "##start") pending = "start";
      if (line === "##end") pending = "end";
      continue;
    }
    if (line.includes("-")) {
      const [a, b] = line.split("-");
      tunnels.push([a, b]);
      continue;
    }
    const parts = line.split(/\s+/);
    if (parts.length === 1 && /^\d+$/.test(parts[0])) {
      ants = parseInt(parts[0], 10);
      continue;
    }
    if (parts.length >= 3) {
      const name = parts[0];
      rooms.set(name, { x: parseFloat(parts[1]), y: parseFloat(parts[2]) });
      if (pending === "start") start = name;
      if (pending === "end") end = name;
      pending = null;
    }
  }

  if (!ants) throw new Error("could not find the ant count");
  if (!rooms.has(start) || !rooms.has(end))
    throw new Error("could not find ##start / ##end rooms");

  const turns = moveLines
    .filter((l) => l.trim() !== "")
    .map((l) =>
      l.trim().split(/\s+/).map((tok) => {
        const m = tok.match(/^L(\d+)-(.+)$/);
        if (!m) throw new Error(`bad move token: "${tok}"`);
        return { ant: parseInt(m[1], 10), room: m[2] };
      })
    );

  return { ants, rooms, tunnels, start, end, turns };
}

// ----------------------------- layout ----------------------------------------

function layout(data, width = 1000, height = 620, pad = 70) {
  const xs = [...data.rooms.values()].map((r) => r.x);
  const ys = [...data.rooms.values()].map((r) => r.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  for (const room of data.rooms.values()) {
    room.pos = {
      x: pad + ((room.x - minX) / spanX) * (width - 2 * pad),
      y: height - (pad + ((room.y - minY) / spanY) * (height - 2 * pad)),
    };
  }
  return { width, height };
}

// ------------------- ant positions -------------------------------------------

function positionsFor(data) {
  const positions = [new Map()];
  for (let ant = 1; ant <= data.ants; ant++)
    positions[0].set(ant, data.start);

  data.turns.forEach((turn, i) => {
    const next = new Map(positions[i]);
    for (const mv of turn) next.set(mv.ant, mv.room);
    positions.push(next);
  });
  return positions;
}

// ------------------- graph building ------------------------------------------

function buildGraph(svg, data) {
  const ns = "http://www.w3.org/2000/svg";
  const make = (tag) => document.createElementNS(ns, tag);

  svg.innerHTML = `
    <defs>
      <radialGradient id="ant-gradient" cx="35%" cy="30%">
        <stop offset="0%" stop-color="#a7f3d0"/>
        <stop offset="100%" stop-color="#14b8a6"/>
      </radialGradient>
    </defs>`;

  const edgeEls = new Map();
  for (const [a, b] of data.tunnels) {
    const line = make("line");
    line.setAttribute("x1", data.rooms.get(a).pos.x);
    line.setAttribute("y1", data.rooms.get(a).pos.y);
    line.setAttribute("x2", data.rooms.get(b).pos.x);
    line.setAttribute("y2", data.rooms.get(b).pos.y);
    line.setAttribute("class", "tunnel");
    svg.appendChild(line);
    edgeEls.set([a, b].sort().join("|"), line);
  }

  for (const [name, room] of data.rooms) {
    const g = make("g");
    const role =
      name === data.start ? " start" : name === data.end ? " end" : "";
    g.setAttribute("class", "room" + role);
    const circle = make("circle");
    const small = data.rooms.size > 30;
    circle.setAttribute("cx", room.pos.x);
    circle.setAttribute("cy", room.pos.y);
    circle.setAttribute("r", small ? 9 : 22);
    const label = make("text");
    label.setAttribute("x", room.pos.x);
    label.setAttribute("y", room.pos.y + (small ? 20 : 38));
    label.textContent = name;
    if (small) label.setAttribute("font-size", "12");
    g.appendChild(circle);
    g.appendChild(label);
    svg.appendChild(g);
    room.el = g;
  }

  const antEls = new Map();
  const antR = data.rooms.size > 30 ? 6 : 14;
  for (let ant = 1; ant <= data.ants; ant++) {
    const g = make("g");
    g.setAttribute("class", "ant");
    const circle = make("circle");
    circle.setAttribute("r", antR);
    const label = make("text");
    if (antR > 6) label.textContent = ant;
    g.appendChild(circle);
    if (antR > 6) g.appendChild(label);
    svg.appendChild(g);
    antEls.set(ant, g);
  }
  return { edgeEls, antEls };
}

// ------------------- rendering -----------------------------------------------

let state = null;

function renderTurn(turn) {
  const { data, positions, graph } = state;
  state.turn = turn;

  for (const [ant, roomName] of positions[turn]) {
    const pos = data.rooms.get(roomName).pos;
    graph.antEls.get(ant).setAttribute("transform", `translate(${pos.x} ${pos.y})`);
  }

  const prev = positions[turn - 1] || positions[0];
  for (const line of graph.edgeEls.values()) line.classList.remove("active");
  if (turn > 0) {
    for (const mv of data.turns[turn - 1]) {
      const from = prev.get(mv.ant);
      const key = [from, mv.room].sort().join("|");
      const line = graph.edgeEls.get(key);
      if (line) line.classList.add("active");
    }
  }

  const crowded = new Set(positions[turn].values());
  for (const [name, room] of data.rooms)
    room.el.classList.toggle("crowded", crowded.has(name));

  document.getElementById("turn-now").textContent = turn;
  document.getElementById("turn-total").textContent = positions.length - 1;
  document.getElementById("log-title").textContent = `Turn ${turn}`;
  const moves = turn === 0 ? [] : data.turns[turn - 1];
  const moveText = moves.length
    ? moves.map((m) => `L${m.ant}-${m.room}`).join("   ")
    : "— no moves this turn —";
  document.getElementById("log-moves").textContent = moveText;
  const arrived = [...positions[turn].values()].filter((r) => r === data.end).length;
  document.getElementById("arrived").textContent = arrived;
  document.getElementById("stat-end").textContent = `${arrived}/${data.ants}`;

  document.getElementById("btn-prev").disabled = turn === 0;
  document.getElementById("btn-next").disabled = turn === positions.length - 1;
}

function step(delta) {
  const last = state.positions.length - 1;
  renderTurn(Math.min(last, Math.max(0, state.turn + delta)));
}

// ------------------- controls -------------------------------------------------

let playTimer = null;

function msPerTurn() {
  return 2100 - parseInt(document.getElementById("speed").value, 10);
}

function play() {
  if (state.turn >= state.positions.length - 1) renderTurn(0);
  document.getElementById("btn-play").textContent = "⏸";
  const tick = () => {
    if (state.turn >= state.positions.length - 1) return pause();
    step(1);
    playTimer = setTimeout(tick, msPerTurn());
  };
  playTimer = setTimeout(tick, msPerTurn() / 2);
}

function pause() {
  clearTimeout(playTimer);
  playTimer = null;
  document.getElementById("btn-play").textContent = "▶";
}

function setupControls() {
  document.getElementById("btn-prev").onclick = () => (playTimer ? pause() : step(-1));
  document.getElementById("btn-next").onclick = () => (playTimer ? pause() : step(1));
  document.getElementById("btn-reset").onclick = () => { pause(); renderTurn(0); };
  document.getElementById("btn-play").onclick = () => (playTimer ? pause() : play());
  document.getElementById("speed").oninput = () => {};
}

// ------------------- loading ---------------------------------------------------

function load(text) {
  pause();
  let data;
  try {
    data = parseOutput(text);
  } catch (err) {
    console.error(err);
    return;
  }
  layout(data);
  const positions = positionsFor(data);
  const graph = buildGraph(document.getElementById("svg"), data);
  state = { data, positions, graph, turn: 0 };

  document.getElementById("stat-ants").textContent = data.ants;
  document.getElementById("stat-rooms").textContent = data.rooms.size;
  document.getElementById("stat-tunnels").textContent = data.tunnels.length;
  document.getElementById("stat-turns").textContent = data.turns.length;
  document.getElementById("arrived-total").textContent = data.ants;
  renderTurn(0);
}

function selectMap(name) {
  load(SOLUTIONS[name] || "");
}

document.addEventListener("DOMContentLoaded", () => {
  setupControls();

  const select = document.getElementById("map-select");
  select.innerHTML = Object.keys(SOLUTIONS)
    .map((name) => `<option value="${name}">${name.replace("example", "map ")}</option>`)
    .join("");
  select.onchange = () => selectMap(select.value);

  selectMap("example02");
  setTimeout(() => play(), 800);
});
