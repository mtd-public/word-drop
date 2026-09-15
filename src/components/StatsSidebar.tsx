import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { GameState } from '../game/types'
import { NextPiece } from './NextPiece'

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <motion.span
        key={value}
        className="stat__value"
        initial={{ scale: 1.25, color: 'var(--accent)' }}
        animate={{ scale: 1, color: 'var(--text)' }}
        transition={{ duration: 0.3 }}
      >
        {value.toLocaleString()}
      </motion.span>
    </div>
  )
}

export function StatsSidebar({ state, children }: { state: GameState; children?: ReactNode }) {
  const upcoming = state.nextQueue[0]

  return (
    <aside className="stats-sidebar">
      <div className="stats-sidebar__section">
        <span className="stat__label">Next</span>
        {upcoming && <NextPiece entry={upcoming} />}
      </div>
      <div className="stats-sidebar__stats">
        <Stat label="Score" value={state.score} />
        <Stat label="Level" value={state.level} />
        <Stat label="Words" value={state.words} />
      </div>
      {children}
    </aside>
  )
}
