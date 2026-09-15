import { motion } from 'framer-motion'
import { PIECE_COLORS } from '../game/pieces'
import type { PieceType } from '../game/types'

interface CellProps {
  type: PieceType | null
  active?: boolean
  clearing?: boolean
}

export function Cell({ type, active, clearing }: CellProps) {
  if (!type) return <div className="cell" />

  return (
    <motion.div
      className={`cell cell--filled${active ? ' cell--active' : ''}`}
      style={{ background: PIECE_COLORS[type] }}
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
