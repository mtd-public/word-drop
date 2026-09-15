export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

/** LR splits a piece left/right (red | blue); TB splits it top/bottom. */
export type SplitStyle = 'LR' | 'TB'
export type PieceColor = 'red' | 'blue'

export const BOARD_COLS = 10
export const BOARD_ROWS = 20

export type Cell = PieceColor | null
export type Grid = Cell[][]

export interface QueueEntry {
  type: PieceType
  split: SplitStyle
}

export interface ActivePiece {
  type: PieceType
  rotation: number
  row: number
  col: number
  split: SplitStyle
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
  dropIntervalMs: number
}
