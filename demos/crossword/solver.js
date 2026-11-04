/**
 * Crossword Puzzle Solver
 *
 * Uses backtracking to fill an empty crossword grid with a list of words.
 * Prints the solved grid or 'Error' if the input is invalid,
 * has no solution, or has multiple solutions.
 */

function crosswordSolver(puzzle, words) {
  // ── Input validation ──────────────────────────────────────────────
  if (typeof puzzle !== 'string' || !Array.isArray(words)) {
    console.log('Error');
    return;
  }
  if (puzzle.length === 0) {
    console.log('Error');
    return;
  }
  // Every word must be a non-empty string
  if (words.some(w => typeof w !== 'string' || w.length === 0)) {
    console.log('Error');
    return;
  }
  // No duplicate words allowed
  if (new Set(words).size !== words.length) {
    console.log('Error');
    return;
  }
  // Validate puzzle characters: only digits 0-2, dots, and newlines
  if (!/^[012.\n]+$/.test(puzzle)) {
    console.log('Error');
    return;
  }

  // ── Parse the grid ────────────────────────────────────────────────
  const grid = puzzle.split('\n').map(row => row.split(''));
  const rows = grid.length;
  const cols = grid[0].length;

  // Make sure all rows have the same length
  if (grid.some(row => row.length !== cols)) {
    console.log('Error');
    return;
  }

  // ── Find all word slots ───────────────────────────────────────────
  // A slot is a sequence of consecutive cells (horizontal or vertical)
  // that starts at a numbered cell and spans through '0' cells.
  const slots = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = grid[r][c];
      if (val === '1' || val === '2') {
        const startCount = parseInt(val);
        let foundStarts = 0;

        // Horizontal slot (only starts if left cell is empty or boundary)
        if ((c === 0 || grid[r][c - 1] === '.') && c + 1 < cols && grid[r][c + 1] !== '.') {
          const cells = [[r, c]];
          let cc = c + 1;
          while (cc < cols && grid[r][cc] !== '.') {
            cells.push([r, cc]);
            cc++;
          }
          if (cells.length > 1) {
            slots.push(cells);
            foundStarts++;
          }
        }

        // Vertical slot (only starts if top cell is empty or boundary)
        if ((r === 0 || grid[r - 1][c] === '.') && r + 1 < rows && grid[r + 1][c] !== '.') {
          const cells = [[r, c]];
          let rr = r + 1;
          while (rr < rows && grid[rr][c] !== '.') {
            cells.push([rr, c]);
            rr++;
          }
          if (cells.length > 1) {
            slots.push(cells);
            foundStarts++;
          }
        }

        if (foundStarts !== startCount) {
          console.log('Error');
          return;
        }
      }
    }
  }

  // ── Validate: slot count must match word count ────────────────────
  if (slots.length !== words.length) {
    console.log('Error');
    return;
  }

  // ── Prepare a working grid for backtracking ───────────────────────
  // Replace numbered cells with null (to be filled), keep '.' as is
  const workGrid = grid.map(row =>
    row.map(cell => (cell === '.' ? '.' : null))
  );

  // Track which words have been used (by index)
  const used = new Array(words.length).fill(false);

  // ── Backtracking solver ───────────────────────────────────────────
  let solutionCount = 0;
  let solution = null;

  /**
   * Check if placing `word` in `slot` is compatible with current grid.
   */
  function canPlace(slot, word) {
    if (word.length !== slot.length) return false;
    for (let i = 0; i < slot.length; i++) {
      const [r, c] = slot[i];
      const cell = workGrid[r][c];
      // Cell must be empty or already hold the same letter
      if (cell !== null && cell !== word[i]) return false;
    }
    return true;
  }

  /**
   * Place `word` into `slot` on the grid. Returns the previous cell
   * values so we can undo the placement.
   */
  function placeWord(slot, word) {
    const backup = [];
    for (let i = 0; i < slot.length; i++) {
      const [r, c] = slot[i];
      backup.push(workGrid[r][c]);
      workGrid[r][c] = word[i];
    }
    return backup;
  }

  /**
   * Remove a word from the grid, restoring the previous cell values.
   */
  function removeWord(slot, backup) {
    for (let i = 0; i < slot.length; i++) {
      const [r, c] = slot[i];
      workGrid[r][c] = backup[i];
    }
  }

  /**
   * Recursive backtracking: try to fill slot at `slotIdx`.
   */
  function solve(slotIdx) {
    // Already found 2 solutions → stop early (we only need uniqueness)
    if (solutionCount > 1) return;

    // All slots filled → found a solution
    if (slotIdx === slots.length) {
      solutionCount++;
      if (solutionCount === 1) {
        // Save the first solution
        solution = workGrid.map(row => row.join(''));
      }
      return;
    }

    const slot = slots[slotIdx];

    for (let w = 0; w < words.length; w++) {
      if (used[w]) continue;
      if (!canPlace(slot, words[w])) continue;

      const backup = placeWord(slot, words[w]);
      used[w] = true;

      solve(slotIdx + 1);

      used[w] = false;
      removeWord(slot, backup);

      if (solutionCount > 1) return; // prune early
    }
  }

  solve(0);

  // ── Output ────────────────────────────────────────────────────────
  if (solutionCount !== 1) {
    console.log('Error');
    return;
  }

  console.log(solution.join('\n'));
}

// Export for testing (unchanged API)
if (typeof module !== "undefined") module.exports = crosswordSolver;
if (typeof window !== "undefined") window.crosswordSolver = crosswordSolver;
