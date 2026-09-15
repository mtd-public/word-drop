import { Board } from './components/Board'
import { Controls } from './components/Controls'
import { GameOverlay } from './components/GameOverlay'
import { Sidebar } from './components/Sidebar'
import { useGameEngine } from './game/useGameEngine'

export default function App() {
  const { state, moveLeft, moveRight, rotate, start, togglePause, newGame } = useGameEngine()
  const playable = state.phase === 'playing'

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="wordmark">Word Drop</h1>
        <div className="topbar__stats">
          <span className="topbar__stat">
            <span className="stat__label">Score</span> {state.score.toLocaleString()}
          </span>
          <span className="topbar__stat">
            <span className="stat__label">Lines</span> {state.lines}
          </span>
        </div>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={togglePause}
          disabled={state.phase !== 'playing' && state.phase !== 'paused'}
        >
          {state.phase === 'paused' ? 'Resume' : 'Pause'}
        </button>
      </header>

      <main className="layout">
        <div className="board-shell">
          <Board state={state} />
          <GameOverlay
            phase={state.phase}
            score={state.score}
            onStart={start}
            onResume={togglePause}
            onNewGame={newGame}
          />
        </div>

        <Sidebar state={state}>
          <Controls orientation="column" onLeft={moveLeft} onRotate={rotate} onRight={moveRight} disabled={!playable} />
        </Sidebar>
      </main>

      <div className="bottom-bar">
        <Controls orientation="row" onLeft={moveLeft} onRotate={rotate} onRight={moveRight} disabled={!playable} />
      </div>
    </div>
  )
}
