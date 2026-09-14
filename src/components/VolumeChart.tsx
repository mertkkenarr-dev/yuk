import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS } from "../lib/calc";
import type { WeekVolumeRow } from "../lib/calc";
import type { MuscleGroup } from "../types";

interface Props {
  data: WeekVolumeRow[];
  muscleGroups: MuscleGroup[];
}

export function VolumeChart({ data, muscleGroups }: Props) {
  const hasAny = data.some((d) => d.total > 0);
  if (!hasAny) return null;

  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-wide text-ink-soft mb-3">Kas grubuna göre haftalık hacim (kg)</p>
      <div className="h-44 rounded-xl border border-border bg-surface shadow-sm p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#A79E92", fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: "#2A241E" }}
              contentStyle={{ background: "#211C17", border: "1px solid #362F27", borderRadius: 8, fontSize: 12, color: "#F5F0EA" }}
              formatter={(value, name) => {
                const v = Number(value);
                if (v === 0) return [null, null] as unknown as [string, string];
                return [`${Math.round(v).toLocaleString("tr-TR")} kg`, MUSCLE_GROUP_LABELS[name as MuscleGroup]];
              }}
              labelFormatter={() => ""}
            />
            {muscleGroups.map((g) => (
              <Bar key={g} dataKey={g} stackId="volume" fill={MUSCLE_GROUP_COLORS[g]} maxBarSize={28} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
