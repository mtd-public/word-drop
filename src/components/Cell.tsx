import { motion } from 'framer-motion'
import { PIECE_COLOR_HEX } from '../game/pieces'
import type { PieceColor } from '../game/types'

interface CellProps {
  color: PieceColor | null
  active?: boolean
  clearing?: boolean
  bursting?: boolean
  age?: number
}

export function Cell({ color, active, clearing, bursting, age }: CellProps) {
  if (!color) return <div className="cell" />

  // Blocks stay axis-aligned at all times (no rotate keyframes) so they read as
  // rigid and upright, even mid-burst or after settling into a new position.
  const animate = bursting
    ? { opacity: [1, 1, 0], scale: [1, 1.3, 0.3], rotate: 0 }
    : clearing
      ? { opacity: [1, 0.25, 1, 0.25, 1], scale: [1, 1.12, 1], rotate: 0 }
      : { opacity: 1, scale: 1, y: 0, rotate: 0 }

  const transition =
    bursting || clearing
      ? { duration: 0.38, ease: 'easeInOut' as const }
      : { type: 'spring' as const, stiffness: 500, damping: 30 }

  return (
    <motion.div
      className={`cell cell--filled${active ? ' cell--active' : ''}`}
      style={{ background: PIECE_COLOR_HEX[color] }}
      initial={{ opacity: 0, scale: active ? 0.6 : 0.82, y: active ? 0 : -8, rotate: 0 }}
      animate={animate}
      transition={transition}
    >
      {typeof age === 'number' && age > 0 && <span className="cell__age">{age}</span>}
    </motion.div>
  )
}
