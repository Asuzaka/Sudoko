export type rows = number[];
export type sudoko = rows[];

/**
 * Ultra-fast Sudoku generator using bit masks + backtracking.
 * - O(1) constraint checks (row/col/box) via bitmasks
 * - Randomized fill for variability
 * - Diagonal boxes prefill to shrink search space (optional, enabled)
 * - No re-validating whole board; validate incrementally only
 */
export class Sudoko {
  // 9x9 board, 0 means empty
  private board: sudoko = Array.from({ length: 9 }, () => Array(9).fill(0));

  // Bit masks: bit k (1<<k) indicates number (k+1) is used.
  private rowMask = new Uint16Array(9); // 9 rows
  private colMask = new Uint16Array(9); // 9 cols
  private boxMask = new Uint16Array(9); // 9 boxes

  // Scratch array reused to avoid allocations
  private candidates = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  /** Public API: generates a *completed* valid Sudoku board (9x9). */
  public generateCompletedBoard(): sudoko {
    this.reset();
    this.prefillDiagonalBoxes(); // big win for performance
    this.fillFrom(0, 0);
    // deep copy to detach internal board
    return this.board.map((row) => row.slice());
  }

  /**
   * Public API: generate a *puzzle* by removing cells from a completed board.
   * - holes: how many cells to remove (rough difficulty knob)
   * - ensureUnique: if true, keep only puzzles with a unique solution (slower)
   */
  public generatePuzzle(holes = 50, ensureUnique = false): sudoko {
    const full = this.generateCompletedBoard();
    const coords: Array<[number, number]> = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) coords.push([r, c]);
    this.shuffle(coords);

    const puzzle = full.map((r) => r.slice());

    let removed = 0;
    for (const [r, c] of coords) {
      if (removed >= holes) break;
      const backup = puzzle[r][c];
      puzzle[r][c] = 0;

      if (ensureUnique) {
        if (!this.hasUniqueSolution(puzzle)) {
          puzzle[r][c] = backup; // revert
          continue;
        }
      }
      removed++;
    }
    return puzzle;
  }

  // -------------------- Core solver/generator --------------------

  private reset() {
    for (let i = 0; i < 9; i++) {
      this.rowMask[i] = 0;
      this.colMask[i] = 0;
      this.boxMask[i] = 0;
      for (let j = 0; j < 9; j++) this.board[i][j] = 0;
    }
  }

  private boxIndex(r: number, c: number): number {
    return ((r / 3) | 0) * 3 + ((c / 3) | 0);
  }

  private isAllowed(r: number, c: number, n: number): boolean {
    const bit = 1 << (n - 1);
    return (
      (this.rowMask[r] & bit) === 0 &&
      (this.colMask[c] & bit) === 0 &&
      (this.boxMask[this.boxIndex(r, c)] & bit) === 0
    );
  }

  private place(r: number, c: number, n: number) {
    const bit = 1 << (n - 1);
    this.board[r][c] = n;
    this.rowMask[r] |= bit;
    this.colMask[c] |= bit;
    this.boxMask[this.boxIndex(r, c)] |= bit;
  }

  private unplace(r: number, c: number, n: number) {
    const bit = 1 << (n - 1);
    this.board[r][c] = 0;
    this.rowMask[r] &= ~bit;
    this.colMask[c] &= ~bit;
    this.boxMask[this.boxIndex(r, c)] &= ~bit;
  }

  /** Fill cells row-major with randomized candidates and early pruning. */
  private fillFrom(r: number, c: number): boolean {
    if (r === 9) return true; // solved

    const nextR = c === 8 ? r + 1 : r;
    const nextC = c === 8 ? 0 : c + 1;

    // Skip prefilled cells
    if (this.board[r][c] !== 0) return this.fillFrom(nextR, nextC);

    const nums = [...this.candidates]; // copy to avoid mutation side-effects
    this.shuffle(nums);

    for (let i = 0; i < 9; i++) {
      const n = nums[i];
      if (!this.isAllowed(r, c, n)) continue;
      this.place(r, c, n);
      if (this.fillFrom(nextR, nextC)) return true;
      this.unplace(r, c, n);
    }
    return false;
  }

  /** Prefill the 3 diagonal 3×3 boxes with random valid numbers. */
  private prefillDiagonalBoxes() {
    for (let b = 0; b < 9; b += 4) {
      // b = 0, 4, 8 are diagonal boxes
      const nums = this.candidates.slice();
      this.shuffle(nums);

      let idx = 0;
      const startR = ((b / 3) | 0) * 3;
      const startC = (b % 3) * 3;
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          const n = nums[idx++];
          const r = startR + dr;
          const c = startC + dc;
          this.place(r, c, n);
        }
      }
    }
  }

  // -------------------- Utility: uniqueness checking --------------------

  /**
   * Returns true if the puzzle has a unique solution.
   * Uses a capped backtracking counter: stop after finding 2 solutions.
   */
  private hasUniqueSolution(puzzle: sudoko): boolean {
    // Load puzzle into board + masks
    this.reset();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = puzzle[r][c];
        if (v !== 0) {
          if (!this.isAllowed(r, c, v)) return false; // invalid puzzle
          this.place(r, c, v);
        }
      }
    }
    let solutions = 0;
    const dfs = (r: number, c: number): boolean => {
      if (r === 9) {
        solutions++;
        return solutions >= 2; // early exit if more than 1
      }
      const nextR = c === 8 ? r + 1 : r;
      const nextC = c === 8 ? 0 : c + 1;

      if (this.board[r][c] !== 0) return dfs(nextR, nextC);

      // Small heuristic: try least-constrained first via mask-based candidates
      const mask =
        this.rowMask[r] | this.colMask[c] | this.boxMask[this.boxIndex(r, c)];
      // iterate numbers 1..9 by available bits
      for (let n = 1; n <= 9; n++) {
        const bit = 1 << (n - 1);
        if (mask & bit) continue;
        this.place(r, c, n);
        if (dfs(nextR, nextC)) return true; // already 2+
        this.unplace(r, c, n);
      }
      return false;
    };
    dfs(0, 0);
    return solutions === 1;
  }

  // -------------------- Helpers --------------------

  private shuffle<T>(arr: T[]): void {
    // Fisher–Yates
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
  }
}
