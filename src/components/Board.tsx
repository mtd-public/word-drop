import { useMemo } from 'react'
import { coloredCellsFor } from '../game/pieces'
import { BOARD_COLS, BOARD_ROWS } from '../game/types'
import type { GameState, PieceColor } from '../game/types'
import { Cell } from './Cell'

interface DisplayCell {
  color: PieceColor | null
  active: boolean
  age?: number
  letter?: string
}

function buildDisplayGrid(state: GameState): DisplayCell[][] {
  const grid: DisplayCell[][] = state.grid.map((row) =>
    row.map((cell) => ({
      color: cell?.color ?? null,
      active: false,
      age: cell?.color === 'red' ? cell.age : undefined,
      letter: cell?.letter,
    })),
  )

  if (state.phase === 'playing' || state.phase === 'paused') {
    coloredCellsFor(state.active.type, state.active.rotation).forEach(({ offset: [dr, dc], color }, i) => {
      const row = state.active.row + dr
      const col = state.active.col + dc
      if (row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS) {
        grid[row][col] = { color, active: true, letter: state.active.letters[i] }
      }
    })
  }

  return grid
}

export function Board({ state }: { state: GameState }) {
  const displayGrid = useMemo(() => buildDisplayGrid(state), [state])
  const clearingSet = useMemo(() => new Set(state.clearingRows), [state.clearingRows])
  const destructingSet = useMemo(
    () => new Set(state.destructingCells.map(([r, c]) => `${r}-${c}`)),
    [state.destructingCells],
  )

  return (
    <div className="board" role="img" aria-label="Tetris board">
      {displayGrid.map((row, r) =>
        row.map((cell, c) => (
          <Cell
            key={`${r}-${c}`}
            color={cell.color}
            active={cell.active}
            clearing={clearingSet.has(r)}
            bursting={destructingSet.has(`${r}-${c}`)}
            age={cell.age}
            letter={cell.letter}
          />
        )),
      )}
    </div>
  )
}
