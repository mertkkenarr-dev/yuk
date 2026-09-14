import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { exerciseProgress, formatWeight, personalBests } from "../lib/calc";
import type { Exercise, WorkoutSession } from "../types";

interface Props {
  exercises: Exercise[];
  sessions: WorkoutSession[];
}

export function ExerciseProgressChart({ exercises, sessions }: Props) {
  const exercisesWithData = exercises.filter((e) => sessions.some((s) => s.exercises.some((se) => se.exerciseId === e.id)));
  const [selected, setSelected] = useState<string | null>(null);

  if (exercisesWithData.length === 0) return null;

  const exerciseId = selected && exercisesWithData.some((e) => e.id === selected) ? selected : exercisesWithData[0].id;
  const data = exerciseProgress(sessions, exerciseId);
  const exercise = exercises.find((e) => e.id === exerciseId);
  const bests = personalBests(sessions, exerciseId);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wide text-ink-soft">İlerleme</p>
        <select
          value={exerciseId}
          onChange={(e) => setSelected(e.target.value)}
          className="bg-surface border border-border rounded-md px-2 py-1 text-xs outline-none focus:border-power"
        >
          {exercisesWithData.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg border border-border bg-surface shadow-sm p-3 text-center">
          <p className="text-[10px] text-ink-soft mb-0.5">En ağır set</p>
          <p className="font-display text-lg text-ink">{formatWeight(bests.maxWeight)} kg</p>
        </div>
        <div className="rounded-lg border border-border bg-surface shadow-sm p-3 text-center">
          <p className="text-[10px] text-ink-soft mb-0.5">En çok tekrar</p>
          <p className="font-display text-lg text-ink">{bests.maxReps}</p>
        </div>
        <div className="rounded-lg border border-power/40 bg-power-soft p-3 text-center">
          <p className="text-[10px] text-power mb-0.5">Tahmini 1RM</p>
          <p className="font-display text-lg text-power">{formatWeight(Math.round(bests.best1RM))} kg</p>
        </div>
      </div>

      <div className="h-48 rounded-xl border border-border bg-surface shadow-sm p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#362F27" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#A79E92", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#A79E92", fontSize: 11 }} width={32} />
            <Tooltip
              contentStyle={{ background: "#211C17", border: "1px solid #362F27", borderRadius: 8, fontSize: 12, color: "#F5F0EA" }}
              formatter={(value, name) => [`${formatWeight(Number(value))} kg`, name === "maxWeight" ? "En ağır set" : "Tahmini 1RM"]}
              labelFormatter={() => exercise?.name ?? ""}
            />
            <Line type="monotone" dataKey="maxWeight" stroke="#A79E92" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="best1RM" stroke="#FF4D2E" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-power inline-block" /> Tahmini 1RM
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-ink-soft inline-block" /> En ağır set
        </span>
      </div>
    </div>
  );
}
