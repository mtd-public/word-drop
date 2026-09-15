import { cellsFor, coloredCellsFor } from './pieces'
import { BOARD_COLS, BOARD_ROWS, RED_LIFESPAN } from './types'
import type { ActivePiece, Cell, Grid } from './types'

export function createEmptyGrid(): Grid {
  return Array.from({ length: BOARD_ROWS }, () => Array<null>(BOARD_COLS).fill(null))
}

export function isValidPosition(grid: Grid, piece: ActivePiece): boolean {
  for (const [dr, dc] of cellsFor(piece.type, piece.rotation)) {
    const row = piece.row + dr
    const col = piece.col + dc
    if (col < 0 || col >= BOARD_COLS || row >= BOARD_ROWS) return false
    if (row < 0) continue
    if (grid[row][col] !== null) return false
  }
  return true
}

export function mergePiece(grid: Grid, piece: ActivePiece): Grid {
  const next = grid.map((row) => [...row])
  coloredCellsFor(piece.type, piece.rotation).forEach(({ offset: [dr, dc], color }, i) => {
    const row = piece.row + dr
    const col = piece.col + dc
    if (row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS) {
      next[row][col] = { color, age: color === 'red' ? RED_LIFESPAN : 0, letter: piece.letters[i] }
    }
  })
  return next
}

/** Ages every placed red cell by one turn, except cells at `skip` coordinates (just placed). */
export function ageRedCells(grid: Grid, skip: Set<string>): Grid {
  return grid.map((row, r) =>
    row.map((cell, c) => {
      if (!cell || cell.color !== 'red' || skip.has(`${r}-${c}`)) return cell
      return { ...cell, age: cell.age - 1 }
    }),
  )
}

export function findExpiredRedCells(grid: Grid): Array<[number, number]> {
  const cells: Array<[number, number]> = []
  grid.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell && cell.color === 'red' && cell.age <= 0) cells.push([r, c])
    })
  })
  return cells
}

/** A row clears purely by being full — shape only, regardless of block color. */
export function findFullRows(grid: Grid): number[] {
  const rows: number[] = []
  grid.forEach((row, index) => {
    if (row.every((cell) => cell !== null)) rows.push(index)
  })
  return rows
}

/** Drops every column's cells down to close any gaps, keeping their relative order. */
export function settleColumns(grid: Grid): Grid {
  const settled = createEmptyGrid()
  for (let col = 0; col < BOARD_COLS; col++) {
    const filled: Cell[] = []
    for (let row = 0; row < BOARD_ROWS; row++) {
      if (grid[row][col] !== null) filled.push(grid[row][col])
    }
    const startRow = BOARD_ROWS - filled.length
    filled.forEach((cell, i) => {
      settled[startRow + i][col] = cell
    })
  }
  return settled
}

/** Removes cleared rows and self-destructed cells, then lets everything above settle. */
export function resolveRemovals(grid: Grid, rows: number[], cells: Array<[number, number]>): Grid {
  const next = grid.map((row) => [...row])
  for (const row of rows) {
    for (let c = 0; c < BOARD_COLS; c++) next[row][c] = null
  }
  for (const [r, c] of cells) next[r][c] = null
  return settleColumns(next)
}
