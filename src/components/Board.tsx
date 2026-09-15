import { useMemo } from 'react'
import { cellsFor } from '../game/pieces'
import { BOARD_COLS, BOARD_ROWS } from '../game/types'
import type { GameState, PieceType } from '../game/types'
import { Cell } from './Cell'

interface DisplayCell {
  type: PieceType | null
  active: boolean
}

function buildDisplayGrid(state: GameState): DisplayCell[][] {
  const grid: DisplayCell[][] = state.grid.map((row) => row.map((type) => ({ type, active: false })))

  if (state.phase === 'playing' || state.phase === 'paused') {
    for (const [dr, dc] of cellsFor(state.active.type, state.active.rotation)) {
      const row = state.active.row + dr
      const col = state.active.col + dc
      if (row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS) {
        grid[row][col] = { type: state.active.type, active: true }
      }
    }
  }

  return grid
}

export function Board({ state }: { state: GameState }) {
  const displayGrid = useMemo(() => buildDisplayGrid(state), [state])
  const clearingSet = useMemo(() => new Set(state.clearingRows), [state.clearingRows])

  return (
    <div className="board" role="img" aria-label="Tetris board">
      {displayGrid.map((row, r) =>
        row.map((cell, c) => (
          <Cell key={`${r}-${c}`} type={cell.type} active={cell.active} clearing={clearingSet.has(r)} />
        )),
      )}
    </div>
  )
}
