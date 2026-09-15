import { useCallback, useEffect, useReducer, useRef } from 'react'
import {
  ageRedCells,
  createEmptyGrid,
  findExpiredRedCells,
  findMonochromeFullRows,
  isValidPosition,
  mergePiece,
  resolveRemovals,
  settleColumns,
} from './board'
import { cellsFor, shuffledBag } from './pieces'
import { dropIntervalForLevel, levelForLines, pointsForClear } from './scoring'
import type { ActivePiece, GameState, QueueEntry } from './types'

const SPAWN_COL = 3
const SPAWN_ROW = -1
const CLEAR_ANIMATION_MS = 380
const WALL_KICKS = [0, -1, 1, -2, 2]

function spawnPiece(entry: QueueEntry): ActivePiece {
  return { type: entry.type, rotation: 0, row: SPAWN_ROW, col: SPAWN_COL }
}

function makeQueue(existing: QueueEntry[]): QueueEntry[] {
  const queue = [...existing]
  while (queue.length < 8) {
    queue.push(...shuffledBag().map((type) => ({ type })))
  }
  return queue
}

function initialState(): GameState {
  const queue = makeQueue([])
  const [first, ...rest] = queue
  return {
    grid: createEmptyGrid(),
    active: spawnPiece(first),
    nextQueue: rest,
    score: 0,
    level: 1,
    lines: 0,
    phase: 'ready',
    clearingRows: [],
    destructingCells: [],
    dropIntervalMs: dropIntervalForLevel(1),
  }
}

type Action =
  | { type: 'START' }
  | { type: 'PAUSE_TOGGLE' }
  | { type: 'MOVE'; dir: -1 | 1 }
  | { type: 'ROTATE' }
  | { type: 'SOFT_DROP' }
  | { type: 'HARD_DROP' }
  | { type: 'TICK' }
  | { type: 'RESOLVE_CLEAR' }
  | { type: 'NEW_GAME' }

function trySpawnNext(state: GameState): GameState {
  const queue = makeQueue(state.nextQueue)
  const [nextEntry, ...rest] = queue
  const piece = spawnPiece(nextEntry)
  const grid = state.grid
  if (!isValidPosition(grid, piece)) {
    return { ...state, active: piece, nextQueue: rest, phase: 'over' }
  }
  return { ...state, active: piece, nextQueue: rest, phase: 'playing' }
}

function lockActivePiece(state: GameState): GameState {
  const merged = mergePiece(state.grid, state.active)

  // The cells this piece just placed are exempt from aging this turn.
  const justPlaced = new Set(
    cellsFor(state.active.type, state.active.rotation).map(
      ([dr, dc]) => `${state.active.row + dr}-${state.active.col + dc}`,
    ),
  )
  const aged = ageRedCells(merged, justPlaced)
  const expiredCells = findExpiredRedCells(aged)
  const clearableRows = findMonochromeFullRows(aged)

  if (expiredCells.length > 0 || clearableRows.length > 0) {
    // Score counts the instant a match locks in — the flash/burst that follows
    // is purely visual, not a gate on when points land.
    const clearedCount = clearableRows.length
    const lines = state.lines + clearedCount
    const level = levelForLines(lines)
    const score = state.score + pointsForClear(clearedCount, state.level)
    return {
      ...state,
      grid: aged,
      clearingRows: clearableRows,
      destructingCells: expiredCells,
      phase: 'clearing',
      lines,
      level,
      score,
      dropIntervalMs: dropIntervalForLevel(level),
    }
  }

  // Nothing to clear or destruct — but pieces can still overhang gaps, so settle now.
  return trySpawnNext({ ...state, grid: settleColumns(aged) })
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START':
      return state.phase === 'ready' ? { ...state, phase: 'playing' } : state

    case 'PAUSE_TOGGLE':
      if (state.phase === 'playing') return { ...state, phase: 'paused' }
      if (state.phase === 'paused') return { ...state, phase: 'playing' }
      return state

    case 'MOVE': {
      if (state.phase !== 'playing') return state
      const moved: ActivePiece = { ...state.active, col: state.active.col + action.dir }
      return isValidPosition(state.grid, moved) ? { ...state, active: moved } : state
    }

    case 'ROTATE': {
      if (state.phase !== 'playing') return state
      const rotation = (state.active.rotation + 1) % 4
      for (const kick of WALL_KICKS) {
        const candidate: ActivePiece = { ...state.active, rotation, col: state.active.col + kick }
        if (isValidPosition(state.grid, candidate)) {
          return { ...state, active: candidate }
        }
      }
      return state
    }

    case 'SOFT_DROP':
    case 'TICK': {
      if (state.phase !== 'playing') return state
      const moved: ActivePiece = { ...state.active, row: state.active.row + 1 }
      if (isValidPosition(state.grid, moved)) {
        return { ...state, active: moved }
      }
      return lockActivePiece(state)
    }

    case 'HARD_DROP': {
      if (state.phase !== 'playing') return state
      let piece = state.active
      while (isValidPosition(state.grid, { ...piece, row: piece.row + 1 })) {
        piece = { ...piece, row: piece.row + 1 }
      }
      return lockActivePiece({ ...state, active: piece })
    }

    case 'RESOLVE_CLEAR': {
      if (state.phase !== 'clearing') return state
      const grid = resolveRemovals(state.grid, state.clearingRows, state.destructingCells)
      return trySpawnNext({
        ...state,
        grid,
        clearingRows: [],
        destructingCells: [],
      })
    }

    case 'NEW_GAME':
      return { ...initialState(), phase: 'playing' }

    default:
      return state
  }
}

export function useGameEngine() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const stateRef = useRef(state)
  stateRef.current = state

  // Gravity tick, paced by the current level's drop interval.
  useEffect(() => {
    if (state.phase !== 'playing') return
    const id = window.setInterval(() => dispatch({ type: 'TICK' }), state.dropIntervalMs)
    return () => window.clearInterval(id)
  }, [state.phase, state.dropIntervalMs])

  // Row-clear flash plays first, then the rows actually collapse.
  useEffect(() => {
    if (state.phase !== 'clearing') return
    const id = window.setTimeout(() => dispatch({ type: 'RESOLVE_CLEAR' }), CLEAR_ANIMATION_MS)
    return () => window.clearTimeout(id)
  }, [state.phase, state.clearingRows])

  const moveLeft = useCallback(() => dispatch({ type: 'MOVE', dir: -1 }), [])
  const moveRight = useCallback(() => dispatch({ type: 'MOVE', dir: 1 }), [])
  const rotate = useCallback(() => dispatch({ type: 'ROTATE' }), [])
  const softDrop = useCallback(() => dispatch({ type: 'SOFT_DROP' }), [])
  const hardDrop = useCallback(() => dispatch({ type: 'HARD_DROP' }), [])
  const start = useCallback(() => dispatch({ type: 'START' }), [])
  const togglePause = useCallback(() => dispatch({ type: 'PAUSE_TOGGLE' }), [])
  const newGame = useCallback(() => dispatch({ type: 'NEW_GAME' }), [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          moveLeft()
          break
        case 'ArrowRight':
          event.preventDefault()
          moveRight()
          break
        case 'ArrowUp':
        case 'x':
        case 'X':
          event.preventDefault()
          rotate()
          break
        case 'ArrowDown':
          event.preventDefault()
          softDrop()
          break
        case ' ':
          event.preventDefault()
          hardDrop()
          break
        case 'p':
        case 'P':
          togglePause()
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [moveLeft, moveRight, rotate, softDrop, hardDrop, togglePause])

  return { state, moveLeft, moveRight, rotate, softDrop, hardDrop, start, togglePause, newGame }
}
