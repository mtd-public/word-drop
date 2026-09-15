import { cellsFor } from './pieces'
import { BOARD_COLS, BOARD_ROWS } from './types'
import type { ActivePiece, Grid } from './types'

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
  for (const [dr, dc] of cellsFor(piece.type, piece.rotation)) {
    const row = piece.row + dr
    const col = piece.col + dc
    if (row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS) {
      next[row][col] = piece.type
    }
  }
  return next
}

export function findFullRows(grid: Grid): number[] {
  const rows: number[] = []
  grid.forEach((row, index) => {
    if (row.every((cell) => cell !== null)) rows.push(index)
  })
  return rows
}

export function clearRows(grid: Grid, rows: number[]): Grid {
  if (rows.length === 0) return grid
  const rowSet = new Set(rows)
  const remaining = grid.filter((_, index) => !rowSet.has(index))
  const cleared = Array.from({ length: rows.length }, () => Array<null>(BOARD_COLS).fill(null))
  return [...cleared, ...remaining]
}
