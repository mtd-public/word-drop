import type { PieceColor, PieceType, SplitStyle } from './types'

// Each rotation is a list of [row, col] offsets within the piece's bounding box.
export const SHAPES: Record<PieceType, Array<Array<[number, number]>>> = {
  I: [
    [[1, 0], [1, 1], [1, 2], [1, 3]],
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[0, 1], [1, 1], [2, 1], [3, 1]],
  ],
  O: [
    [[0, 1], [0, 2], [1, 1], [1, 2]],
    [[0, 1], [0, 2], [1, 1], [1, 2]],
    [[0, 1], [0, 2], [1, 1], [1, 2]],
    [[0, 1], [0, 2], [1, 1], [1, 2]],
  ],
  T: [
    [[0, 1], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 2], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 1]],
    [[0, 1], [1, 0], [1, 1], [2, 1]],
  ],
  S: [
    [[0, 1], [0, 2], [1, 0], [1, 1]],
    [[0, 1], [1, 1], [1, 2], [2, 2]],
    [[1, 1], [1, 2], [2, 0], [2, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
  ],
  Z: [
    [[0, 0], [0, 1], [1, 1], [1, 2]],
    [[0, 2], [1, 1], [1, 2], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[0, 1], [1, 0], [1, 1], [2, 0]],
  ],
  J: [
    [[0, 0], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [0, 2], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 0], [2, 1]],
  ],
  L: [
    [[0, 2], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [1, 1], [1, 2], [2, 0]],
    [[0, 0], [0, 1], [1, 1], [2, 1]],
  ],
}

export const PIECE_COLOR_HEX: Record<PieceColor, string> = {
  red: '#dd4b3e',
  blue: '#3e6fd8',
}

export const PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

/** Fisher-Yates shuffle of a fresh 7-bag, so every piece appears once per 7. */
export function shuffledBag(): PieceType[] {
  const bag = [...PIECE_TYPES]
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[bag[i], bag[j]] = [bag[j], bag[i]]
  }
  return bag
}

export function randomSplit(): SplitStyle {
  return Math.random() < 0.5 ? 'LR' : 'TB'
}

export function cellsFor(type: PieceType, rotation: number): Array<[number, number]> {
  return SHAPES[type][rotation % 4]
}

/**
 * Colors a piece's own cells red/blue by sorting them along the split axis
 * (columns for LR, rows for TB) and taking the first two as red, last two as
 * blue — always an exact 2/2 split, recomputed fresh for the current rotation.
 */
export function splitColorMap(
  type: PieceType,
  rotation: number,
  split: SplitStyle,
): Record<string, PieceColor> {
  const cells = cellsFor(type, rotation)
  const sorted = [...cells].sort(([ar, ac], [br, bc]) => {
    const primary = split === 'LR' ? ac - bc : ar - br
    if (primary !== 0) return primary
    return split === 'LR' ? ar - br : ac - bc
  })

  const map: Record<string, PieceColor> = {}
  sorted.forEach(([r, c], index) => {
    map[`${r}-${c}`] = index < 2 ? 'red' : 'blue'
  })
  return map
}
