import { useCallback, useEffect, useReducer, useRef } from 'react'
import { clearRows, createEmptyGrid, findFullRows, isValidPosition, mergePiece } from './board'
import { shuffledBag } from './pieces'
import { dropIntervalForLevel, levelForLines, pointsForClear } from './scoring'
import type { ActivePiece, GameState, PieceType } from './types'

const SPAWN_COL = 3
const SPAWN_ROW = -1
const CLEAR_ANIMATION_MS = 380
const WALL_KICKS = [0, -1, 1, -2, 2]

function spawnPiece(type: PieceType): ActivePiece {
  return { type, rotation: 0, row: SPAWN_ROW, col: SPAWN_COL }
}

function makeQueue(existing: PieceType[]): PieceType[] {
  const queue = [...existing]
  while (queue.length < 8) queue.push(...shuffledBag())
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
  const [nextType, ...rest] = queue
  const piece = spawnPiece(nextType)
  const grid = state.grid
  if (!isValidPosition(grid, piece)) {
    return { ...state, active: piece, nextQueue: rest, phase: 'over' }
  }
  return { ...state, active: piece, nextQueue: rest, phase: 'playing' }
}

function lockActivePiece(state: GameState): GameState {
  const merged = mergePiece(state.grid, state.active)
  const fullRows = findFullRows(merged)
  if (fullRows.length > 0) {
    return { ...state, grid: merged, clearingRows: fullRows, phase: 'clearing' }
  }
  return trySpawnNext({ ...state, grid: merged })
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
      const clearedCount = state.clearingRows.length
      const grid = clearRows(state.grid, state.clearingRows)
      const lines = state.lines + clearedCount
      const level = levelForLines(lines)
      const score = state.score + pointsForClear(clearedCount, state.level)
      const next = trySpawnNext({
        ...state,
        grid,
        lines,
        level,
        score,
        clearingRows: [],
        dropIntervalMs: dropIntervalForLevel(level),
      })
      return next
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
