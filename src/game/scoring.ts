const LINE_POINTS: Record<number, number> = { 1: 100, 2: 300, 3: 500, 4: 800 }

export function pointsForClear(lineCount: number, level: number): number {
  return (LINE_POINTS[lineCount] ?? 0) * level
}

export function levelForLines(totalLines: number): number {
  return Math.floor(totalLines / 10) + 1
}

export function dropIntervalForLevel(level: number): number {
  return Math.max(120, 800 - (level - 1) * 60)
}
