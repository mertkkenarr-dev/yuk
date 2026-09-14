import type { Exercise, MuscleGroup, SessionExercise, SetEntry, WorkoutSession } from "../types";

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  gogus: "Göğüs",
  sirt: "Sırt",
  bacak: "Bacak",
  omuz: "Omuz",
  kol: "Kol",
  karin: "Karın",
  kardiyo: "Kardiyo",
  "tam-vucut": "Tam Vücut",
};

export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  gogus: "#FF4D2E",
  sirt: "#FFC24D",
  bacak: "#4ADE80",
  omuz: "#60A5FA",
  kol: "#F472B6",
  karin: "#A78BFA",
  kardiyo: "#22D3EE",
  "tam-vucut": "#A79E92",
};

export const EQUIPMENT_LABELS: Record<Exercise["equipment"], string> = {
  halter: "Halter",
  dambil: "Dambıl",
  makine: "Makine",
  "vucut-agirligi": "Vücut Ağırlığı",
  kablo: "Kablo",
  diger: "Diğer",
};

function dateToISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Today's date as yyyy-mm-dd in local time (never toISOString — it's UTC and drifts a day near midnight). */
export function todayISO(): string {
  return dateToISO(new Date());
}

export function estimated1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return weight * (1 + reps / 30);
}

function sessionExerciseFor(session: WorkoutSession, exerciseId: string): SessionExercise | undefined {
  return session.exercises.find((e) => e.exerciseId === exerciseId);
}

/** Working sets only — warm-up sets don't count toward PRs, volume, or progress. */
export function workingSets(sets: SetEntry[]): SetEntry[] {
  return sets.filter((s) => !s.isWarmup);
}

export interface PersonalBests {
  maxWeight: number;
  maxReps: number;
  best1RM: number;
}

/** Best-ever stats for an exercise, only counting sessions strictly before `beforeDate` (or all, if omitted). */
export function personalBests(sessions: WorkoutSession[], exerciseId: string, beforeDate?: string): PersonalBests {
  let maxWeight = 0;
  let maxReps = 0;
  let best1RM = 0;
  for (const session of sessions) {
    if (beforeDate && session.date >= beforeDate) continue;
    const se = sessionExerciseFor(session, exerciseId);
    if (!se) continue;
    for (const set of workingSets(se.sets)) {
      maxWeight = Math.max(maxWeight, set.weight);
      maxReps = Math.max(maxReps, set.reps);
      best1RM = Math.max(best1RM, estimated1RM(set.weight, set.reps));
    }
  }
  return { maxWeight, maxReps, best1RM };
}

export interface PRHit {
  type: "weight" | "reps" | "1rm";
  value: number;
  set: SetEntry;
}

/** Compares newSets against every prior session (strictly before sessionDate) and returns any records broken. */
export function detectPRs(
  sessions: WorkoutSession[],
  exerciseId: string,
  newSets: SetEntry[],
  sessionDate: string,
): PRHit[] {
  const before = personalBests(sessions, exerciseId, sessionDate);
  const hits: PRHit[] = [];
  let bestWeightSoFar = before.maxWeight;
  let bestRepsSoFar = before.maxReps;
  let best1RMSoFar = before.best1RM;

  for (const set of workingSets(newSets)) {
    if (set.weight > 0 && set.weight > bestWeightSoFar) {
      hits.push({ type: "weight", value: set.weight, set });
      bestWeightSoFar = set.weight;
    }
    if (set.reps > bestRepsSoFar) {
      hits.push({ type: "reps", value: set.reps, set });
      bestRepsSoFar = set.reps;
    }
    const oneRM = estimated1RM(set.weight, set.reps);
    if (set.weight > 0 && oneRM > best1RMSoFar) {
      hits.push({ type: "1rm", value: oneRM, set });
      best1RMSoFar = oneRM;
    }
  }
  return hits;
}

/** Suggests the next weight based on the most recent logged session for this exercise. */
export function suggestNextWeight(
  sessions: WorkoutSession[],
  exerciseId: string,
  targetReps: number,
  progressionStep: number,
): number | null {
  const past = sessions
    .filter((s) => sessionExerciseFor(s, exerciseId))
    .sort((a, b) => b.date.localeCompare(a.date));
  const last = past[0];
  if (!last) return null;
  const se = sessionExerciseFor(last, exerciseId)!;
  const sets = workingSets(se.sets);
  if (sets.length === 0) return null;

  const lastWeight = Math.max(...sets.map((s) => s.weight));
  const allHitTarget = sets.every((s) => s.reps >= targetReps);
  return allHitTarget ? lastWeight + progressionStep : lastWeight;
}

export interface ExerciseProgressPoint {
  date: string;
  label: string;
  maxWeight: number;
  best1RM: number;
}

export function exerciseProgress(sessions: WorkoutSession[], exerciseId: string): ExerciseProgressPoint[] {
  return sessions
    .filter((s) => sessionExerciseFor(s, exerciseId))
    .map((s) => {
      const sets = workingSets(sessionExerciseFor(s, exerciseId)!.sets);
      const maxWeight = Math.max(...sets.map((set) => set.weight), 0);
      const best1RM = Math.max(...sets.map((set) => estimated1RM(set.weight, set.reps)), 0);
      return {
        date: s.date,
        label: new Date(s.date).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" }),
        maxWeight,
        best1RM: Math.round(best1RM),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** The working sets logged the last time this exercise was done, for showing "geçen sefer" hints while logging. */
export function lastLoggedSets(sessions: WorkoutSession[], exerciseId: string): SetEntry[] | null {
  const past = sessions.filter((s) => sessionExerciseFor(s, exerciseId)).sort((a, b) => b.date.localeCompare(a.date));
  const last = past[0];
  if (!last) return null;
  const sets = workingSets(sessionExerciseFor(last, exerciseId)!.sets);
  return sets.length > 0 ? sets : null;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function weekKeyOf(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return dateToISO(startOfWeek(new Date(y, m - 1, d)));
}

export type WeekVolumeRow = { weekKey: string; label: string; total: number } & Record<string, number | string>;

export function weeklyVolumeByMuscleGroup(
  sessions: WorkoutSession[],
  exercises: Exercise[],
  weeks = 8,
): WeekVolumeRow[] {
  const exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e]));
  const groups = Array.from(new Set(exercises.map((e) => e.muscleGroup)));
  const currentWeekStart = startOfWeek(new Date());
  const result: WeekVolumeRow[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const ws = new Date(currentWeekStart);
    ws.setDate(ws.getDate() - i * 7);
    const key = dateToISO(ws);
    const weekSessions = sessions.filter((s) => weekKeyOf(s.date) === key);
    const row: WeekVolumeRow = { weekKey: key, label: ws.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" }), total: 0 };
    for (const g of groups) row[g] = 0;

    for (const session of weekSessions) {
      for (const se of session.exercises) {
        const ex = exerciseMap[se.exerciseId];
        if (!ex) continue;
        const volume = workingSets(se.sets).reduce((sum, s) => sum + s.weight * s.reps, 0);
        row[ex.muscleGroup] = (row[ex.muscleGroup] as number) + volume;
        row.total += volume;
      }
    }
    result.push(row);
  }
  return result;
}

export interface HeatDay {
  date: string;
  hasSession: boolean;
}

export function heatmapDays(sessions: WorkoutSession[], days = 70): HeatDay[] {
  const dates = new Set(sessions.map((s) => s.date));
  const result: HeatDay[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dateToISO(d);
    result.push({ date: key, hasSession: dates.has(key) });
  }
  return result;
}

/** Consecutive weeks (ending this week or last) with at least one logged session. */
export function currentWeekStreak(sessions: WorkoutSession[]): number {
  const weeksWithSessions = new Set(sessions.map((s) => weekKeyOf(s.date)));
  const cursor = startOfWeek(new Date());
  const thisWeekKey = dateToISO(cursor);
  if (!weeksWithSessions.has(thisWeekKey)) cursor.setDate(cursor.getDate() - 7);

  let streak = 0;
  while (weeksWithSessions.has(dateToISO(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

export interface CalendarDay {
  date: string;
  inMonth: boolean;
  muscleGroups: MuscleGroup[];
  routineDayName?: string;
}

/** Full calendar grid (Monday-first, padded to whole weeks) for the given 1-indexed month. */
export function monthCalendar(sessions: WorkoutSession[], exercises: Exercise[], year: number, month: number): CalendarDay[] {
  const exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e]));
  const first = new Date(year, month - 1, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month, 0).getDate();
  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() - startWeekday);

  const byDate = new Map<string, WorkoutSession[]>();
  for (const s of sessions) {
    const arr = byDate.get(s.date) ?? [];
    arr.push(s);
    byDate.set(s.date, arr);
  }

  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  const result: CalendarDay[] = [];
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    const key = dateToISO(d);
    const daySessions = byDate.get(key) ?? [];
    const groups = new Set<MuscleGroup>();
    for (const s of daySessions) {
      for (const se of s.exercises) {
        const ex = exerciseMap[se.exerciseId];
        if (ex) groups.add(ex.muscleGroup);
      }
    }
    result.push({
      date: key,
      inMonth: d.getMonth() === month - 1,
      muscleGroups: Array.from(groups),
      routineDayName: daySessions[0]?.routineDayName,
    });
  }
  return result;
}

export function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

export function totalVolume(session: WorkoutSession): number {
  return session.exercises.reduce(
    (sum, se) => sum + workingSets(se.sets).reduce((s, set) => s + set.weight * set.reps, 0),
    0,
  );
}

export function formatWeight(kg: number): string {
  return kg % 1 === 0 ? `${kg}` : kg.toFixed(1);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} sa` : `${h} sa ${m} dk`;
}
