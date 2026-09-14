import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatWeight, todayISO } from "../lib/calc";
import type { BodyWeightEntry } from "../types";

interface Props {
  entries: BodyWeightEntry[];
  onAdd: (entry: Omit<BodyWeightEntry, "id">) => void;
}

export function BodyWeightTracker({ entries, onAdd }: Props) {
  const [weight, setWeight] = useState("");
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const chartData = sorted.map((e) => ({
    ...e,
    label: new Date(e.date).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" }),
  }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(weight.replace(",", "."));
    if (!value || value <= 0) return;
    onAdd({ date: todayISO(), weight: value });
    setWeight("");
  }

  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-wide text-ink-soft mb-3">Vücut Ağırlığı</p>
      <div className="rounded-xl border border-border bg-surface shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          {latest ? (
            <div>
              <p className="font-display text-2xl">{formatWeight(latest.weight)} kg</p>
              <p className="text-xs text-ink-soft">
                Son ölçüm: {new Date(latest.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
              </p>
            </div>
          ) : (
            <p className="text-sm text-ink-soft">Henüz ölçüm yok.</p>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              placeholder="kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-20 bg-bg border border-border rounded-md px-2 py-1.5 text-sm outline-none focus:border-power font-display"
            />
            <button type="submit" className="px-3 py-1.5 text-sm bg-power text-white rounded-md hover:opacity-90">
              Kaydet
            </button>
          </form>
        </div>

        {chartData.length > 1 && (
          <div className="h-32 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="#362F27" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#A79E92", fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#A79E92", fontSize: 10 }} width={28} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ background: "#211C17", border: "1px solid #362F27", borderRadius: 8, fontSize: 12, color: "#F5F0EA" }}
                  formatter={(value) => [`${formatWeight(Number(value))} kg`, "Ağırlık"]}
                  labelFormatter={() => ""}
                />
                <Line type="monotone" dataKey="weight" stroke="#FFC24D" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
