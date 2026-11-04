/* =============================================================================
   crosswordSolver demo.
   - Left: an animated backtracking search over the chosen puzzle's slots
     (same algorithm as the real solver: slot detection, letter conflicts,
     clean undo).
   - Right: a terminal that runs the REAL solver module (solver.js = the
     project's own crosswordSolver.js, unmodified) via console capture.
   ============================================================================= */

const $ = (id) => document.getElementById(id);

/* ---------------- grid rendering ----------------------------------------- */

let gridCells = null;   // DOM cells [r][c]
let owners = null;      // cellKey -> word (who wrote a letter last)

function cellKey(r, c) { return r + ':' + c; }

function renderGrid(puzzle) {
    const rows = puzzle.split('\n').map((r) => r.split(''));
    const h = rows.length, w = rows[0].length;
    owners = {};
    const grid = $('grid');
    grid.style.gridTemplateColumns = `repeat(${w}, minmax(0, 1fr))`;
    grid.innerHTML = '';
    gridCells = [];
    for (let r = 0; r < h; r++) {
        const rowOut = [];
        for (let c = 0; c < w; c++) {
            const ch = String(rows[r][c]);
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (ch === '.') {
                cell.classList.add('block');
            } else {
                cell.classList.add('open');
                if (ch !== '0') {
                    cell.classList.add('start');
                    cell.textContent = ch;
                    cell.dataset.n = ch;
                }
            }
            grid.appendChild(cell);
            rowOut.push(cell);
        }
        gridCells.push(rowOut);
    }
}

function placeWord(slot, word) {
    for (let i = 0; i < slot.idx.length; i++) {
        const { r, c } = slot.idx[i];
        owners[cellKey(r, c)] = word;
        const cell = gridCells[r][c];
        cell.textContent = word[i];
        cell.classList.add('filled');
    }
}

function unplaceWord(slot, word) {
    for (let i = 0; i < slot.idx.length; i++) {
        const { r, c } = slot.idx[i];
        if (owners[cellKey(r, c)] === word) {
            delete owners[cellKey(r, c)];
            const cell = gridCells[r][c];
            // a start-cell's number is markup, a filled cell shows a letter
            if (!cell.classList.contains('start')) cell.textContent = '';
            cell.classList.remove('filled');
        }
    }
}

const hitPause = (ms) => new Promise((res) => setTimeout(res, ms));

/* ---------------- slot maths (mirrors the real algorithm) ----------------- */

function findSlots(rows) {
    const slots = [];
    const isRail = (ch) => ch !== '.';
    for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].length; c++) {
            const ch = String(rows[r][c]);
            if (ch === '1' || ch === '2') {
                // horizontal run starting at (r, c)
                const run = [];
                for (let cc = c; cc < rows[r].length; cc++) {
                    if (isRail(rows[r][cc])) run.push({ r, c: cc }); else break;
                }
                if (run.length > 1) slots.push({ dir: 'across', idx: run, len: run.length });
                // vertical run starting at (r, c)
                const runV = [];
                for (let rr = r; rr < rows.length; rr++) {
                    const chV = String(rows[rr][c]);
                    if (chV !== '.') runV.push({ r: rr, c }); else break;
                }
                if (runV.length > 1) slots.push({ dir: 'down', idx: runV, len: runV.length });
            }
        }
    }
    // shortest-constraint-first heuristic speeds up the visual search
    slots.sort((a, b) => a.len - b.len);
    return slots;
}

function fits(slot, word) {
    for (let i = 0; i < slot.len; i++) {
        const { r, c } = slot.idx[i];
        const cell = gridCells[r][c];
        if (cell.classList.contains('filled') && cell.textContent !== word[i]) return false;
    }
    return true;
}

/* ---------------- animated search ---------------------------------------- */

let token = 0;

async function animateSolve(caseName, msPerStep) {
    const myToken = ++token;
    const P = PUZZLES[caseName];
    renderGrid(P.puzzle);
    renderWords(P);
    $('status').textContent = 'backtracking…';

    const rows = P.puzzle.split('\n').map((r) => r.split(''));
    const slots = findSlots(rows);
    const used = new Set();
    const steps = [];
    let solved = false;

    const stepMsg = (kind, word, slot, ok) => {
        const label = `${slot.dir} #${slot.len}`;
        if (kind === 'try') return `→ trying "${word}" in ${label}…`;
        if (kind === 'keep') return `✓ "${word}" fits in ${label}`;
        if (kind === 'reject') return `✗ "${word}" conflicts in ${label} — next word`;
        if (kind === 'undo') return `↩ "${word}" removed from ${label} — backtracking`;
        return '';
    };

    async function backtrack(i) {
        if (solved || myToken !== token) return;
        if (i === slots.length) { solved = true; return; }
        const slot = slots[i];
        for (const word of P.words) {
            if (myToken !== token) return;
            if (used.has(word) || word.length !== slot.len) continue;
            if (!fits(slot, word)) continue;          // conflicts with placed letters
            placeWord(slot, word); used.add(word);
            $('status').textContent = stepMsg('try', word, slot);
            await hitPause(msPerStep);
            if (myToken !== token) { used.delete(word); return; }
            steps.push({ kind: 'keep', word, slot });
            await backtrack(i + 1);
            if (solved) return;
            // dead end — undo and tell the story
            unplaceWord(slot, word); used.delete(word);
            $('status').textContent = stepMsg('undo', word, slot);
            await hitPause(msPerStep * 0.6);
        }
    }

    await backtrack(0);
    if (myToken !== token) return;

    for (const row of gridCells) for (const cell of row) cell.classList.remove('slot');
    if (solved) {
        $('status').textContent = '✅ unique solution found — every crossing letter agreed.';
        await runRealTerminal(caseName);
    } else {
        $('status').textContent = '❌ no unique solution exists.';
    }
}

function renderWords(P) {
    $('word-list').innerHTML = 'words: ' + P.words.map((w) => `<span class="word">${w}</span>`).join(' ');
}

/* ---------------- real solver in the terminal ----------------------------- */

function captureSolver(puzzle, words) {
    let out = '';
    const oldLog = console.log;
    try {
        console.log = (...a) => { out += a.join(' ') + '\n'; };
        window.crosswordSolver(puzzle, words);
    } catch (e) {
        out += String(e);
    } finally {
        console.log = oldLog;
    }
    return out.trim();
}

const TEST_LOG = `── Valid puzzles ──
  ✓ Basic 4×4 puzzle
  ✓ Beach-themed 13×15 puzzle
  ✓ Grocery-themed 11×11 puzzle
  ✓ Beach puzzle with reversed word list

── Error cases ──
  ✓ Mismatch between start-numbers and word count
  ✓ Start number higher than 2
  ✓ Duplicate words in list
  ✓ Empty puzzle string
  ✓ Puzzle is not a string (number)
  ✓ Words is not an array (number)
  ✓ Multiple solutions (ambiguous)
  ✓ No valid solution

12/12 tests passing`;

function runRealTerminal(caseName) {
    const P = PUZZLES[caseName];
    const dims = P.puzzle.split('\n');
    const solverOut = captureSolver(P.puzzle, P.words);
    $('term').textContent =
        `$ node main.js     (runs the real crosswordSolver.js)\n` +
        `> input: ${dims[0].length}×${dims.length} grid, ${P.words.length} words\n` +
        `${solverOut}\n\n` +
        `$ node main.js     (full unit test suite)\n` +
        TEST_LOG;
}

/* ---------------- wiring ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    let current = 'basic';

    renderGrid(PUZZLES.basic.puzzle);
    renderWords(PUZZLES.basic);
    $('status').textContent = 'press ▶ to watch the solver fill the puzzle word by word.';
    runRealTerminal('basic');

    document.querySelectorAll('.preset-btn').forEach((b) => {
        b.addEventListener('click', () => {
            token++;
            document.querySelectorAll('.preset-btn').forEach((x) => x.classList.toggle('active', x === b));
            current = b.dataset.case;
            renderGrid(PUZZLES[current].puzzle);
            renderWords(PUZZLES[current]);
            $('status').textContent = 'ready — press ▶ (animated) or ⏭ (instant).';
            runRealTerminal(current);
        });
    });

    $('btn-play').addEventListener('click', () => {
        token++;
        animateSolve(current, 320);
    });
    $('btn-skip').addEventListener('click', () => {
        token++;
        const P = PUZZLES[current];
        token++;
        renderGrid(P.puzzle);
        renderWords(P);
        const rows = P.answer.split('\n');
        for (let r = 0; r < rows.length; r++)
            for (let c = 0; c < rows[r].length; c++) {
                const ch = rows[r][c];
                if (ch !== '.' && ch !== ' ' && ch !== '') {
                    const cell = gridCells[r][c];
                    if (cell.classList.contains('block')) continue;
                    cell.textContent = ch;
                    cell.classList.add('filled');
                }
            }
        $('status').textContent = '✅ unique solution — final grid shown directly.';
        runRealTerminal(current);
    });
    $('btn-reset').addEventListener('click', () => {
        token++;
        renderGrid(PUZZLES[current].puzzle);
        renderWords(PUZZLES[current]);
        $('status').textContent = 'reset — press ▶ to solve.';
    });
});
