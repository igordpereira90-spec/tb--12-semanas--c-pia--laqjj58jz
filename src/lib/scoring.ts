export const MAX_XP = 1000

export interface PointCalculation {
  base: number
  streak: number
  total: number
}

const SCHEDULED_WEEKS = [0, 2, 4, 6, 8, 10, 12]

const WEEKLY_BASE_POINTS: Record<number, number> = {
  0: 100,
  2: 110,
  4: 120,
  6: 135,
  8: 145,
  10: 155,
  12: 170,
}

export function getBasePoints(weekNumber: number): number {
  return WEEKLY_BASE_POINTS[weekNumber] ?? 100
}

export function getPreviousScheduledWeek(weekNumber: number): number | null {
  const idx = SCHEDULED_WEEKS.indexOf(weekNumber)
  if (idx <= 0) return null
  return SCHEDULED_WEEKS[idx - 1]
}

export function calculateQuestionnairePoints(
  weekNumber: number,
  completedWeeks: number[],
): PointCalculation {
  const base = getBasePoints(weekNumber)
  const prevWeek = getPreviousScheduledWeek(weekNumber)
  const hasStreak = prevWeek !== null && completedWeeks.includes(prevWeek)
  const streak = hasStreak ? 5 : 0
  return { base, streak, total: base + streak }
}

export function getXPProgress(points: number): number {
  return Math.min(100, (points / MAX_XP) * 100)
}
