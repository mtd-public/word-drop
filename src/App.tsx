import { Board } from './components/Board'
import { Controls } from './components/Controls'
import { GameOverlay } from './components/GameOverlay'
import { KeyboardHelp } from './components/KeyboardHelp'
import { StatsSidebar } from './components/StatsSidebar'
import { WordToast } from './components/WordToast'
import { WordsSidebar } from './components/WordsSidebar'
import { useGameEngine } from './game/useGameEngine'
import { useSwipeControls } from './hooks/useSwipeControls'

export default function App() {
  const { state, moveLeft, moveRight, rotate, hardDrop, start, togglePause, newGame } = useGameEngine()
  const playable = state.phase === 'playing'
  const swipeHandlers = useSwipeControls({ onSwipeLeft: moveLeft, onSwipeRight: moveRight, onSwipeDown: hardDrop })

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="wordmark">Word Drop</h1>
        <div className="topbar__stats">
          <span className="topbar__stat">
            <span className="stat__label">Score</span> {state.score.toLocaleString()}
          </span>
          <span className="topbar__stat">
            <span className="stat__label">Words</span> {state.words}
          </span>
        </div>
        <div className="topbar__actions">
          <KeyboardHelp />
          <button
            type="button"
            className="btn btn--ghost"
            onClick={togglePause}
            disabled={state.phase !== 'playing' && state.phase !== 'paused'}
          >
            {state.phase === 'paused' ? 'Resume' : 'Pause'}
          </button>
        </div>
      </header>

      <main className="layout">
        <div className="side-panels">
          <StatsSidebar state={state}>
            <Controls onLeft={moveLeft} onRotate={rotate} onRight={moveRight} disabled={!playable} />
          </StatsSidebar>
          <WordsSidebar words={state.wordHistory} />
        </div>

        <div className="board-shell" {...swipeHandlers}>
          <Board state={state} />
          <WordToast matches={state.phase === 'clearing' ? state.wordMatches : []} />
          <GameOverlay
            phase={state.phase}
            score={state.score}
            onStart={start}
            onResume={togglePause}
            onNewGame={newGame}
          />
        </div>
      </main>

      <div className="footer-bar">
        <button type="button" className="btn btn--footer-side" onClick={moveLeft} disabled={!playable} aria-label="Move left">
          ◀
        </button>
        <button
          type="button"
          className="btn btn--rotate btn--footer-rotate"
          onClick={rotate}
          disabled={!playable}
          aria-label="Rotate piece"
        >
          ↻ Rotate
        </button>
        <button type="button" className="btn btn--footer-side" onClick={moveRight} disabled={!playable} aria-label="Move right">
          ▶
        </button>
      </div>
    </div>
  )
}
