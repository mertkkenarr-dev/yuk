import type { AppState, Exercise } from "../types";

const STORAGE_KEY = "yuk-antrenman-v1";

export const DEFAULT_EXERCISES: Exercise[] = [
  { id: "bench-press", name: "Bench Press", muscleGroup: "gogus", equipment: "halter" },
  { id: "incline-db-press", name: "Eğimli Dambıl Press", muscleGroup: "gogus", equipment: "dambil" },
  { id: "squat", name: "Squat", muscleGroup: "bacak", equipment: "halter" },
  { id: "deadlift", name: "Deadlift", muscleGroup: "bacak", equipment: "halter" },
  { id: "leg-press", name: "Leg Press", muscleGroup: "bacak", equipment: "makine" },
  { id: "pull-up", name: "Barfiks", muscleGroup: "sirt", equipment: "vucut-agirligi" },
  { id: "barbell-row", name: "Barbell Row", muscleGroup: "sirt", equipment: "halter" },
  { id: "lat-pulldown", name: "Lat Pulldown", muscleGroup: "sirt", equipment: "kablo" },
  { id: "overhead-press", name: "Overhead Press", muscleGroup: "omuz", equipment: "halter" },
  { id: "lateral-raise", name: "Lateral Raise", muscleGroup: "omuz", equipment: "dambil" },
  { id: "bicep-curl", name: "Barbell Curl", muscleGroup: "kol", equipment: "halter" },
  { id: "triceps-pushdown", name: "Triceps Pushdown", muscleGroup: "kol", equipment: "kablo" },
  { id: "plank", name: "Plank", muscleGroup: "karin", equipment: "vucut-agirligi" },
  { id: "running", name: "Koşu", muscleGroup: "kardiyo", equipment: "diger" },
];

function defaultState(): AppState {
  return { exercises: DEFAULT_EXERCISES, routines: [], sessions: [] };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.exercises?.length) parsed.exercises = DEFAULT_EXERCISES;
    if (!parsed.routines) parsed.routines = [];
    if (!parsed.sessions) parsed.sessions = [];
    return parsed;
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportStateAsJSON(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function parseImportedState(raw: string): AppState {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed?.exercises) || !Array.isArray(parsed?.sessions)) {
    throw new Error("Geçersiz dosya: egzersizler veya antrenmanlar bulunamadı.");
  }
  return {
    exercises: parsed.exercises,
    routines: Array.isArray(parsed.routines) ? parsed.routines : [],
    sessions: parsed.sessions,
  };
}
