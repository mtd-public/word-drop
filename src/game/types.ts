export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export const BOARD_COLS = 10
export const BOARD_ROWS = 20

export type Cell = PieceType | null
export type Grid = Cell[][]

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
  nextQueue: PieceType[]
  score: number
  level: number
  lines: number
  phase: GamePhase
  clearingRows: number[]
  dropIntervalMs: number
}
