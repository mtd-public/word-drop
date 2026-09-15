export type PieceType = 'I' | 'O' | 'T' | 'Z' | 'J' | 'L'

export type PieceColor = 'red' | 'blue'

export const BOARD_COLS = 10
export const BOARD_ROWS = 20

/** A placed red cell self-destructs this many turns (piece locks) after landing. */
export const RED_LIFESPAN = 3

export interface FilledCell {
  color: PieceColor
  /** Turns remaining before self-destruct. Only meaningful for red cells. */
  age: number
}

export type Cell = FilledCell | null
export type Grid = Cell[][]

export interface QueueEntry {
  type: PieceType
}

export interface ActivePiece {
  type: PieceType
  rotation: number
  row: number
  col: number
}

export type GamePhase = 'ready' | 'playing' | 'paused' | 'clearing' | 'over'

export interface GameState {
  grid: Grid
  active: ActivePiece
  nextQueue: QueueEntry[]
  score: number
  level: number
  lines: number
  phase: GamePhase
  clearingRows: number[]
  destructingCells: Array<[number, number]>
  dropIntervalMs: number
}
