export type MuscleGroup = "gogus" | "sirt" | "bacak" | "omuz" | "kol" | "karin" | "kardiyo" | "tam-vucut";
export type Equipment = "halter" | "dambil" | "makine" | "vucut-agirligi" | "kablo" | "diger";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
}

export interface SetEntry {
  weight: number;
  reps: number;
}

export interface RoutineExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  /** kg to add to the suggested weight once all sets hit targetReps. */
  progressionStep: number;
}

export interface RoutineDay {
  id: string;
  name: string; // e.g. "İtme Günü"
  exercises: RoutineExercise[];
}

export interface Routine {
  id: string;
  name: string; // e.g. "Push / Pull / Legs"
  days: RoutineDay[];
}

export interface SessionExercise {
  exerciseId: string;
  sets: SetEntry[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO date (yyyy-mm-dd)
  routineDayName?: string;
  exercises: SessionExercise[];
}

export interface AppState {
  exercises: Exercise[];
  routines: Routine[];
  sessions: WorkoutSession[];
}
