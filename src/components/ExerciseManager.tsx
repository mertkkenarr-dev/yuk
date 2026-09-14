import { useState } from "react";
import { EQUIPMENT_LABELS, MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS } from "../lib/calc";
import type { Equipment, Exercise, MuscleGroup } from "../types";

interface Props {
  exercises: Exercise[];
  onAdd: (e: Exercise) => void;
  onDelete: (id: string) => void;
}

const MUSCLE_GROUPS = Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[];
const EQUIPMENT_TYPES = Object.keys(EQUIPMENT_LABELS) as Equipment[];

export function ExerciseManager({ exercises, onAdd, onDelete }: Props) {
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>("gogus");
  const [equipment, setEquipment] = useState<Equipment>("halter");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = trimmed.toLocaleLowerCase("tr-TR").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    onAdd({ id: id || crypto.randomUUID(), name: trimmed, muscleGroup, equipment });
    setName("");
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-soft mb-3">Egzersiz Kütüphanesi</p>

      <div className="rounded-xl border border-border bg-surface shadow-sm divide-y divide-border mb-3 max-h-72 overflow-y-auto">
        {exercises.map((ex) => (
          <div key={ex.id} className="group flex items-center gap-3 px-4 py-2 text-sm">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: MUSCLE_GROUP_COLORS[ex.muscleGroup] }} />
            <span className="flex-1 truncate">{ex.name}</span>
            <span className="text-xs text-ink-soft">{MUSCLE_GROUP_LABELS[ex.muscleGroup]}</span>
            <span className="text-xs text-ink-soft">· {EQUIPMENT_LABELS[ex.equipment]}</span>
            <button
              onClick={() => onDelete(ex.id)}
              className="opacity-0 group-hover:opacity-100 text-ink-soft hover:text-power transition-opacity px-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="rounded-xl border border-border bg-surface shadow-sm p-3 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Yeni egzersiz adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[140px] bg-bg border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-power"
        />
        <select
          value={muscleGroup}
          onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
          className="bg-bg border border-border rounded-md px-2 py-1.5 text-sm outline-none focus:border-power"
        >
          {MUSCLE_GROUPS.map((g) => (
            <option key={g} value={g}>
              {MUSCLE_GROUP_LABELS[g]}
            </option>
          ))}
        </select>
        <select
          value={equipment}
          onChange={(e) => setEquipment(e.target.value as Equipment)}
          className="bg-bg border border-border rounded-md px-2 py-1.5 text-sm outline-none focus:border-power"
        >
          {EQUIPMENT_TYPES.map((eq) => (
            <option key={eq} value={eq}>
              {EQUIPMENT_LABELS[eq]}
            </option>
          ))}
        </select>
        <button type="submit" className="px-3 py-1.5 text-sm bg-power text-white rounded-md hover:opacity-90">
          Ekle
        </button>
      </form>
    </div>
  );
}
