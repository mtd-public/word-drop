import { motion } from 'framer-motion'
import { PIECE_COLOR_HEX } from '../game/pieces'
import type { PieceColor } from '../game/types'

interface CellProps {
  color: PieceColor | null
  active?: boolean
  clearing?: boolean
}

export function Cell({ color, active, clearing }: CellProps) {
  if (!color) return <div className="cell" />

  return (
    <motion.div
      className={`cell cell--filled${active ? ' cell--active' : ''}`}
      style={{ background: PIECE_COLOR_HEX[color] }}
      initial={active ? { opacity: 0, scale: 0.6 } : false}
      animate={
        clearing
          ? { opacity: [1, 0.25, 1, 0.25, 1], scale: [1, 1.12, 1] }
          : { opacity: 1, scale: 1 }
      }
      transition={
        clearing
          ? { duration: 0.38, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 500, damping: 30 }
      }
    />
  )
}
