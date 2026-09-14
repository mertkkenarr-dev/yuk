import { useState } from "react";
import type { Exercise, Routine, RoutineDay, RoutineExercise } from "../types";

interface Props {
  routines: Routine[];
  exercises: Exercise[];
  onAdd: (routine: Routine) => void;
  onDelete: (id: string) => void;
}

export function RoutineManager({ routines, exercises, onAdd, onDelete }: Props) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [days, setDays] = useState<RoutineDay[]>([]);
  const [dayName, setDayName] = useState("");

  function addDay() {
    if (!dayName.trim()) return;
    setDays((d) => [...d, { id: crypto.randomUUID(), name: dayName.trim(), exercises: [] }]);
    setDayName("");
  }

  function removeDay(dayId: string) {
    setDays((d) => d.filter((x) => x.id !== dayId));
  }

  function addExerciseToDay(dayId: string, re: RoutineExercise) {
    setDays((d) => d.map((x) => (x.id === dayId ? { ...x, exercises: [...x.exercises, re] } : x)));
  }

  function removeExerciseFromDay(dayId: string, exerciseId: string) {
    setDays((d) =>
      d.map((x) => (x.id === dayId ? { ...x, exercises: x.exercises.filter((e) => e.exerciseId !== exerciseId) } : x)),
    );
  }

  function save() {
    if (!name.trim() || days.length === 0) return;
    onAdd({ id: crypto.randomUUID(), name: name.trim(), days });
    setName("");
    setDays([]);
    setCreating(false);
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-soft mb-3">Rutinler</p>

      {routines.length > 0 && (
        <div className="rounded-xl border border-border bg-surface shadow-sm divide-y divide-border mb-3">
          {routines.map((r) => (
            <div key={r.id} className="group flex items-center gap-3 px-4 py-2.5 text-sm">
              <span className="flex-1">
                {r.name} <span className="text-ink-soft text-xs">({r.days.length} gün)</span>
              </span>
              <button
                onClick={() => onDelete(r.id)}
                className="opacity-0 group-hover:opacity-100 text-ink-soft hover:text-power transition-opacity px-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {!creating ? (
        <button
          onClick={() => setCreating(true)}
          className="text-power hover:opacity-80 text-sm underline underline-offset-2"
        >
          + Yeni rutin oluştur
        </button>
      ) : (
        <div className="rounded-xl border border-border bg-surface shadow-sm p-4 space-y-3">
          <input
            type="text"
            placeholder="Rutin adı (örn. Push / Pull / Legs)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-power"
          />

          {days.map((day) => (
            <DayEditor
              key={day.id}
              day={day}
              exercises={exercises}
              onAddExercise={(re) => addExerciseToDay(day.id, re)}
              onRemoveExercise={(exId) => removeExerciseFromDay(day.id, exId)}
              onRemoveDay={() => removeDay(day.id)}
            />
          ))}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Gün adı (örn. İtme Günü)"
              value={dayName}
              onChange={(e) => setDayName(e.target.value)}
              className="flex-1 bg-bg border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-power"
            />
            <button onClick={addDay} className="px-3 py-1.5 text-sm bg-bg border border-border rounded-md hover:border-power">
              Gün ekle
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setCreating(false)} className="px-4 py-1.5 text-sm text-ink-soft hover:text-ink">
              Vazgeç
            </button>
            <button onClick={save} className="px-4 py-1.5 text-sm bg-power text-white rounded-md hover:opacity-90">
              Rutini Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DayEditor({
  day,
  exercises,
  onAddExercise,
  onRemoveExercise,
  onRemoveDay,
}: {
  day: RoutineDay;
  exercises: Exercise[];
  onAddExercise: (re: RoutineExercise) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onRemoveDay: () => void;
}) {
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? "");
  const [targetSets, setTargetSets] = useState("3");
  const [targetReps, setTargetReps] = useState("10");
  const [progressionStep, setProgressionStep] = useState("2.5");
  const exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e]));

  function add() {
    if (!exerciseId || day.exercises.some((e) => e.exerciseId === exerciseId)) return;
    onAddExercise({
      exerciseId,
      targetSets: parseInt(targetSets) || 3,
      targetReps: parseInt(targetReps) || 10,
      progressionStep: parseFloat(progressionStep) || 0,
    });
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{day.name}</span>
        <button onClick={onRemoveDay} className="text-xs text-ink-soft hover:text-power">
          Günü sil
        </button>
      </div>

      {day.exercises.map((re) => (
        <div key={re.exerciseId} className="flex items-center gap-2 text-xs text-ink-soft py-1">
          <span className="flex-1">
            {exerciseMap[re.exerciseId]?.name} — {re.targetSets}×{re.targetReps}, +{re.progressionStep}kg
          </span>
          <button onClick={() => onRemoveExercise(re.exerciseId)} className="hover:text-power px-1">
            ×
          </button>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          className="bg-bg border border-border rounded-md px-2 py-1 text-xs outline-none focus:border-power"
        >
          {exercises.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={targetSets}
          onChange={(e) => setTargetSets(e.target.value)}
          className="w-12 bg-bg border border-border rounded-md px-1.5 py-1 text-xs outline-none focus:border-power"
          title="Hedef set sayısı"
        />
        <span className="text-xs text-ink-soft">×</span>
        <input
          type="number"
          value={targetReps}
          onChange={(e) => setTargetReps(e.target.value)}
          className="w-12 bg-bg border border-border rounded-md px-1.5 py-1 text-xs outline-none focus:border-power"
          title="Hedef tekrar"
        />
        <span className="text-xs text-ink-soft">+</span>
        <input
          type="number"
          value={progressionStep}
          onChange={(e) => setProgressionStep(e.target.value)}
          className="w-14 bg-bg border border-border rounded-md px-1.5 py-1 text-xs outline-none focus:border-power"
          title="Progresyon adımı (kg)"
        />
        <button onClick={add} className="px-2 py-1 text-xs bg-power text-white rounded-md hover:opacity-90">
          Ekle
        </button>
      </div>
    </div>
  );
}
