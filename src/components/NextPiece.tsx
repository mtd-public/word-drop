import { PIECE_COLOR_HEX, splitColorMap } from '../game/pieces'
import type { QueueEntry } from '../game/types'

const PREVIEW_COLS = 4
const PREVIEW_ROWS = 3

export function NextPiece({ entry }: { entry: QueueEntry }) {
  const colors = splitColorMap(entry.type, 0, entry.split)

  const cells = []
  for (let r = 0; r < PREVIEW_ROWS; r++) {
    for (let c = 0; c < PREVIEW_COLS; c++) {
      const color = colors[`${r}-${c}`]
      cells.push(
        <div
          key={`${r}-${c}`}
          className={`next-cell${color ? ' next-cell--filled' : ''}`}
          style={color ? { background: PIECE_COLOR_HEX[color] } : undefined}
        />,
      )
    }
  }

  return <div className="next-grid">{cells}</div>
}
