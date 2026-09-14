import { useEffect, useRef, useState } from "react";
import { formatWeight, lastLoggedSets, suggestNextWeight, todayISO } from "../lib/calc";
import { RestTimer } from "./RestTimer";
import type { Exercise, Routine, SessionExercise, SetEntry, WorkoutSession } from "../types";

interface Props {
  exercises: Exercise[];
  routines: Routine[];
  sessions: WorkoutSession[];
  onSave: (session: Omit<WorkoutSession, "id">) => void;
}

interface DraftExercise {
  exerciseId: string;
  sets: SetEntry[];
}

const DEFAULT_REST_SECONDS = 90;

export function SessionForm({ exercises, routines, sessions, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [routineDayName, setRoutineDayName] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState<DraftExercise[]>([]);
  const [pickExerciseId, setPickExerciseId] = useState(exercises[0]?.id ?? "");
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [restKey, setRestKey] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  const exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e]));

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [open]);

  function openForm() {
    startedAtRef.current = Date.now();
    setElapsedSec(0);
    setOpen(true);
  }

  function startFromRoutineDay(routineId: string, dayId: string) {
    const routine = routines.find((r) => r.id === routineId);
    const day = routine?.days.find((d) => d.id === dayId);
    if (!day) return;
    setRoutineDayName(day.name);
    setDraft(
      day.exercises.map((re) => {
        const suggested = suggestNextWeight(sessions, re.exerciseId, re.targetReps, re.progressionStep);
        const weight = suggested ?? 0;
        return {
          exerciseId: re.exerciseId,
          sets: Array.from({ length: re.targetSets }, () => ({ weight, reps: re.targetReps })),
        };
      }),
    );
  }

  function addExercise() {
    if (!pickExerciseId) return;
    if (draft.some((d) => d.exerciseId === pickExerciseId)) return;
    setDraft((d) => [...d, { exerciseId: pickExerciseId, sets: [{ weight: 0, reps: 0 }] }]);
  }

  function removeExercise(exerciseId: string) {
    setDraft((d) => d.filter((x) => x.exerciseId !== exerciseId));
  }

  function addSet(exerciseId: string) {
    setDraft((d) =>
      d.map((x) => {
        if (x.exerciseId !== exerciseId) return x;
        const last = x.sets[x.sets.length - 1];
        return { ...x, sets: [...x.sets, last ? { ...last, isWarmup: false } : { weight: 0, reps: 0 }] };
      }),
    );
  }

  function removeSet(exerciseId: string, index: number) {
    setDraft((d) =>
      d.map((x) => (x.exerciseId === exerciseId ? { ...x, sets: x.sets.filter((_, i) => i !== index) } : x)),
    );
  }

  function updateSet(exerciseId: string, index: number, field: keyof SetEntry, value: number | boolean) {
    setDraft((d) =>
      d.map((x) =>
        x.exerciseId === exerciseId
          ? { ...x, sets: x.sets.map((s, i) => (i === index ? { ...s, [field]: value } : s)) }
          : x,
      ),
    );
  }

  function reset() {
    setDraft([]);
    setRoutineDayName(undefined);
    setDate(todayISO());
    setOpen(false);
    setRestSeconds(null);
  }

  function handleSave() {
    const exercisesOut: SessionExercise[] = draft
      .map((d) => ({ exerciseId: d.exerciseId, sets: d.sets.filter((s) => s.weight > 0 || s.reps > 0) }))
      .filter((d) => d.sets.length > 0);
    if (exercisesOut.length === 0) return;
    const durationMinutes = startedAtRef.current ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 60000)) : undefined;
    onSave({ date, routineDayName, durationMinutes, exercises: exercisesOut });
    reset();
  }

  if (!open) {
    return (
      <button
        onClick={openForm}
        className="mb-8 w-full rounded-xl border border-dashed border-power/40 bg-power-soft/40 text-power font-display text-sm py-4 hover:bg-power-soft transition-colors"
      >
        + ANTRENMAN BAŞLAT
      </button>
    );
  }

  const elapsedLabel = `${String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:${String(elapsedSec % 60).padStart(2, "0")}`;

  return (
    <div className="mb-8 rounded-xl border border-border bg-surface shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <h2 className="font-display text-sm">{routineDayName ?? "Antrenman"}</h2>
          <span className="text-xs text-gold font-display tabular-nums">{elapsedLabel}</span>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-bg border border-border rounded-md px-2 py-1 text-xs outline-none focus:border-power"
        />
      </div>

      {routines.length > 0 && draft.length === 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {routines.flatMap((r) =>
            r.days.map((d) => (
              <button
                key={d.id}
                onClick={() => startFromRoutineDay(r.id, d.id)}
                className="px-3 py-1.5 text-xs bg-bg border border-border rounded-md hover:border-power transition-colors"
              >
                {r.name} — {d.name}
              </button>
            )),
          )}
        </div>
      )}

      <div className="space-y-4">
        {draft.map((d) => {
          const ex = exerciseMap[d.exerciseId];
          const previous = lastLoggedSets(sessions, d.exerciseId);
          return (
            <div key={d.exerciseId} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{ex?.name ?? "—"}</span>
                <button onClick={() => removeExercise(d.exerciseId)} className="text-ink-soft hover:text-power text-xs">
                  Egzersizi kaldır
                </button>
              </div>
              {previous && (
                <p className="text-[11px] text-ink-soft mb-2">
                  Geçen sefer: {previous.map((s) => `${formatWeight(s.weight)}×${s.reps}`).join(", ")}
                </p>
              )}
              <div className="space-y-1.5">
                {d.sets.map((set, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-ink-soft w-4">{i + 1}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="kg"
                      value={set.weight || ""}
                      onChange={(e) => updateSet(d.exerciseId, i, "weight", parseFloat(e.target.value) || 0)}
                      className="w-20 bg-bg border border-border rounded-md px-2 py-1 text-sm outline-none focus:border-power font-display"
                    />
                    <span className="text-ink-soft text-xs">kg ×</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="tekrar"
                      value={set.reps || ""}
                      onChange={(e) => updateSet(d.exerciseId, i, "reps", parseInt(e.target.value) || 0)}
                      className="w-20 bg-bg border border-border rounded-md px-2 py-1 text-sm outline-none focus:border-power font-display"
                    />
                    <span className="text-ink-soft text-xs">tekrar</span>
                    <label className="flex items-center gap-1 text-[11px] text-ink-soft cursor-pointer ml-1">
                      <input
                        type="checkbox"
                        checked={!!set.isWarmup}
                        onChange={(e) => updateSet(d.exerciseId, i, "isWarmup", e.target.checked)}
                        className="accent-gold"
                      />
                      ısınma
                    </label>
                    <button
                      onClick={() => {
                        setRestSeconds(DEFAULT_REST_SECONDS);
                        setRestKey((k) => k + 1);
                      }}
                      className="text-ink-soft hover:text-power px-1"
                      aria-label="Dinlenme sayacı başlat"
                      title="Dinlenme sayacı başlat"
                    >
                      ⏱
                    </button>
                    <button
                      onClick={() => removeSet(d.exerciseId, i)}
                      className="text-ink-soft hover:text-power px-1"
                      aria-label="Seti sil"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => addSet(d.exerciseId)} className="mt-2 text-xs text-power hover:opacity-80">
                + Set ekle
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <select
          value={pickExerciseId}
          onChange={(e) => setPickExerciseId(e.target.value)}
          className="flex-1 bg-bg border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-power"
        >
          {exercises.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <button onClick={addExercise} className="px-3 py-2 text-sm bg-bg border border-border rounded-md hover:border-power transition-colors">
          Egzersiz ekle
        </button>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button onClick={reset} className="px-4 py-2 text-sm text-ink-soft hover:text-ink">
          Vazgeç
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm bg-power text-white font-medium rounded-md shadow-sm hover:opacity-90 transition-opacity"
        >
          Antrenmanı Bitir
        </button>
      </div>

      {restSeconds !== null && <RestTimer key={restKey} seconds={restSeconds} onDismiss={() => setRestSeconds(null)} />}
    </div>
  );
}
