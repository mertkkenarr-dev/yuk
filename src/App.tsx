import { useEffect, useState } from "react";
import { BackupBar } from "./components/BackupBar";
import { BodyWeightTracker } from "./components/BodyWeightTracker";
import { ExerciseManager } from "./components/ExerciseManager";
import { ExerciseProgressChart } from "./components/ExerciseProgressChart";
import { PRBanner } from "./components/PRBanner";
import { RoutineManager } from "./components/RoutineManager";
import { SessionForm } from "./components/SessionForm";
import { SessionList } from "./components/SessionList";
import { StatsHeader } from "./components/StatsHeader";
import { StreakHeatmap } from "./components/StreakHeatmap";
import { VolumeChart } from "./components/VolumeChart";
import { WorkoutCalendar } from "./components/WorkoutCalendar";
import {
  currentWeekStreak,
  detectPRs,
  heatmapDays,
  weeklyVolumeByMuscleGroup,
} from "./lib/calc";
import type { PRHit } from "./lib/calc";
import { loadState, saveState } from "./lib/storage";
import type { AppState, BodyWeightEntry, Exercise, MuscleGroup, Routine, WorkoutSession } from "./types";

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [showSettings, setShowSettings] = useState(false);
  const [prAlert, setPrAlert] = useState<{ exerciseName: string; hits: PRHit[] } | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const exerciseMap = Object.fromEntries(state.exercises.map((e) => [e.id, e]));
  const muscleGroups = Array.from(new Set(state.exercises.map((e) => e.muscleGroup))) as MuscleGroup[];
  const weekStreak = currentWeekStreak(state.sessions);
  const heatmap = heatmapDays(state.sessions, 70);
  const volumeTrend = weeklyVolumeByMuscleGroup(state.sessions, state.exercises, 8);
  const thisWeekVolume = (volumeTrend[volumeTrend.length - 1]?.total as number) ?? 0;

  function addSession(session: Omit<WorkoutSession, "id">) {
    const allHits: PRHit[] = [];
    let firstExerciseName = "";
    for (const se of session.exercises) {
      const hits = detectPRs(state.sessions, se.exerciseId, se.sets, session.date);
      if (hits.length > 0 && !firstExerciseName) firstExerciseName = exerciseMap[se.exerciseId]?.name ?? "";
      allHits.push(...hits);
    }
    const withId: WorkoutSession = { ...session, id: crypto.randomUUID() };
    setState((s) => ({ ...s, sessions: [...s.sessions, withId] }));
    if (allHits.length > 0) setPrAlert({ exerciseName: firstExerciseName, hits: allHits });
  }

  function deleteSession(id: string) {
    setState((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }));
  }

  function addExercise(e: Exercise) {
    setState((s) => ({ ...s, exercises: [...s.exercises, e] }));
  }

  function deleteExercise(id: string) {
    setState((s) => ({ ...s, exercises: s.exercises.filter((e) => e.id !== id) }));
  }

  function addRoutine(r: Routine) {
    setState((s) => ({ ...s, routines: [...s.routines, r] }));
  }

  function deleteRoutine(id: string) {
    setState((s) => ({ ...s, routines: s.routines.filter((r) => r.id !== id) }));
  }

  function addBodyWeight(entry: Omit<BodyWeightEntry, "id">) {
    const withId: BodyWeightEntry = { ...entry, id: crypto.randomUUID() };
    setState((s) => ({ ...s, bodyWeights: [...s.bodyWeights, withId] }));
  }

  return (
    <div className="relative min-h-screen text-ink overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-power/25 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-gold/15 blur-3xl" />
      </div>

      {prAlert && (
        <PRBanner hits={prAlert.hits} exerciseName={prAlert.exerciseName} onDismiss={() => setPrAlert(null)} />
      )}

      <div className="relative max-w-2xl mx-auto px-5 py-10">
        <header className="mb-8 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-ink flex items-center justify-center shrink-0 shadow-md">
            <div className="flex items-center">
              <div className="w-1.5 h-5 rounded-sm bg-power" />
              <div className="w-1 h-3.5 rounded-sm bg-power/70 -ml-px" />
              <div className="w-5 h-1.5 rounded-sm bg-ink-soft mx-0.5" />
              <div className="w-1 h-3.5 rounded-sm bg-power/70 -mr-px" />
              <div className="w-1.5 h-5 rounded-sm bg-power" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-2xl">YÜK</h1>
            <p className="text-sm text-ink-soft -mt-0.5">Antrenman günlüğün</p>
          </div>
        </header>

        <StatsHeader
          totalSessions={state.sessions.length}
          weekStreak={weekStreak}
          thisWeekVolume={thisWeekVolume}
        />

        <SessionForm exercises={state.exercises} routines={state.routines} sessions={state.sessions} onSave={addSession} />

        <ExerciseProgressChart exercises={state.exercises} sessions={state.sessions} />
        <BodyWeightTracker entries={state.bodyWeights} onAdd={addBodyWeight} />
        <VolumeChart data={volumeTrend} muscleGroups={muscleGroups} />
        <WorkoutCalendar sessions={state.sessions} exercises={state.exercises} />
        <StreakHeatmap days={heatmap} />

        <p className="text-xs uppercase tracking-wide text-ink-soft mb-3">Antrenmanlar</p>
        <SessionList sessions={state.sessions} exercises={state.exercises} onDelete={deleteSession} />

        <div className="mt-10 pt-6 border-t border-border">
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="text-xs uppercase tracking-wide text-ink-soft hover:text-ink"
          >
            {showSettings ? "Ayarları gizle" : "Ayarlar"}
          </button>
          {showSettings && (
            <div className="mt-4 space-y-6">
              <RoutineManager routines={state.routines} exercises={state.exercises} onAdd={addRoutine} onDelete={deleteRoutine} />
              <ExerciseManager exercises={state.exercises} onAdd={addExercise} onDelete={deleteExercise} />
              <BackupBar state={state} onImport={setState} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
