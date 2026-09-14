import { formatWeight, totalVolume } from "../lib/calc";
import type { Exercise, WorkoutSession } from "../types";

interface Props {
  sessions: WorkoutSession[];
  exercises: Exercise[];
  onDelete: (id: string) => void;
}

export function SessionList({ sessions, exercises, onDelete }: Props) {
  const exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e]));
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-ink-soft py-8 text-center rounded-xl border border-dashed border-border">
        Henüz antrenman kaydı yok.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((s) => (
        <div key={s.id} className="group rounded-xl border border-border bg-surface shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium">
                {s.routineDayName ?? "Serbest Antrenman"}
              </p>
              <p className="text-xs text-ink-soft">
                {new Date(s.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-display text-sm text-power">{Math.round(totalVolume(s)).toLocaleString("tr-TR")} kg</span>
              <button
                onClick={() => onDelete(s.id)}
                className="opacity-0 group-hover:opacity-100 text-ink-soft hover:text-power transition-opacity px-1"
              >
                ×
              </button>
            </div>
          </div>
          <div className="text-xs text-ink-soft space-y-0.5">
            {s.exercises.map((se) => (
              <p key={se.exerciseId}>
                {exerciseMap[se.exerciseId]?.name ?? "—"}:{" "}
                {se.sets.map((set) => `${formatWeight(set.weight)}×${set.reps}`).join(", ")}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
