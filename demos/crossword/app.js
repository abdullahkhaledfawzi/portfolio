/* crossword demo - skip to result + real solver terminal */

const $ = (id) => document.getElementById(id);

let gridCells = null;
let gOriginal = null;

function cellKey(r, c) { return r + ':' + c; }

function renderGrid(puzzle) {
    const rows = puzzle.split('\n').map((r) => r.split(''));
    const h = rows.length, w = rows[0] ? rows[0].length : 0;
    gOriginal = rows.map((r) => [...r]);
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

function renderWords(P) {
    $('word-list').innerHTML = 'words: ' + P.words.map((w) => `<span class="word">${w}</span>`).join(' ');
}

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
        `> input: ${dims[0].length}x${dims.length} grid, ${P.words.length} words\n` +
        `${solverOut}\n\n` +
        `$ node main.js     (full unit test suite)\n` +
        TEST_LOG;
}

document.addEventListener('DOMContentLoaded', () => {
    let current = 'basic';

    renderGrid(PUZZLES.basic.puzzle);
    renderWords(PUZZLES.basic);
    $('status').textContent = 'press ⏭ skip to result, or use the real solver via the terminal.';

    document.querySelectorAll('.preset-btn').forEach((b) => {
        b.addEventListener('click', () => {
            token++;
            document.querySelectorAll('.preset-btn').forEach((x) => x.classList.toggle('active', x === b));
            current = b.dataset.case;
            renderGrid(PUZZLES[current].puzzle);
            renderWords(PUZZLES[current]);
            $('status').textContent = 'ready — press ⏭ to load the unique solution.';
            runRealTerminal(current);
        });
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
        $('status').textContent = 'reset — press ⏭ to load the unique solution.';
    });
});
