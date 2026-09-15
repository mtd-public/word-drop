import { cellsFor, PIECE_COLORS } from '../game/pieces'
import type { PieceType } from '../game/types'

const PREVIEW_COLS = 4
const PREVIEW_ROWS = 3

export function NextPiece({ type }: { type: PieceType }) {
  const occupied = new Set(cellsFor(type, 0).map(([r, c]) => `${r}-${c}`))

  const cells = []
  for (let r = 0; r < PREVIEW_ROWS; r++) {
    for (let c = 0; c < PREVIEW_COLS; c++) {
      const filled = occupied.has(`${r}-${c}`)
      cells.push(
        <div
          key={`${r}-${c}`}
          className={`next-cell${filled ? ' next-cell--filled' : ''}`}
          style={filled ? { background: PIECE_COLORS[type] } : undefined}
        />,
      )
    }
  }

  return <div className="next-grid">{cells}</div>
}
