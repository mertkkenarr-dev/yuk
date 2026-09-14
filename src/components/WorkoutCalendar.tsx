import { useState } from "react";
import type { CalendarDay } from "../lib/calc";
import { formatWeight, MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS, monthCalendar, monthLabel, totalVolume } from "../lib/calc";
import type { Exercise, WorkoutSession } from "../types";

interface Props {
  sessions: WorkoutSession[];
  exercises: Exercise[];
}

const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function WorkoutCalendar({ sessions, exercises }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e]));
  const days = monthCalendar(sessions, exercises, year, month);
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  function goMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
    setSelectedDate(null);
  }

  const selectedSessions = selectedDate ? sessions.filter((s) => s.date === selectedDate) : [];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wide text-ink-soft">Takvim</p>
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => goMonth(-1)} className="text-ink-soft hover:text-ink px-1" aria-label="Önceki ay">
            ◀
          </button>
          <span className="capitalize w-28 text-center">{monthLabel(year, month)}</span>
          <button onClick={() => goMonth(1)} className="text-ink-soft hover:text-ink px-1" aria-label="Sonraki ay">
            ▶
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-sm p-4">
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-[10px] text-ink-soft">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day: CalendarDay) => {
            const dayNum = Number(day.date.split("-")[2]);
            const isToday = day.date === todayKey;
            const isSelected = selectedDate === day.date;
            const hasSession = day.muscleGroups.length > 0;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(hasSession ? day.date : null)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
                  day.inMonth ? "text-ink" : "text-ink-soft/30"
                } ${isSelected ? "bg-power-soft" : hasSession ? "hover:bg-bg" : ""} ${isToday ? "ring-1 ring-gold" : ""}`}
              >
                <span>{dayNum}</span>
                <div className="flex gap-0.5">
                  {day.muscleGroups.slice(0, 4).map((g) => (
                    <span key={g} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MUSCLE_GROUP_COLORS[g] }} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedSessions.length > 0 && (
        <div className="mt-2 rounded-xl border border-border bg-surface shadow-sm p-3 text-sm space-y-3">
          {selectedSessions.map((s) => (
            <div key={s.id}>
              <div className="flex items-baseline justify-between mb-1.5">
                <p className="font-medium">{s.routineDayName ?? "Serbest Antrenman"}</p>
                <span className="font-display text-power text-xs">{Math.round(totalVolume(s)).toLocaleString("tr-TR")} kg</span>
              </div>
              <div className="space-y-1">
                {s.exercises.map((se) => {
                  const ex = exerciseMap[se.exerciseId];
                  return (
                    <div key={se.exerciseId} className="flex items-center gap-2 text-xs text-ink-soft">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ex ? MUSCLE_GROUP_COLORS[ex.muscleGroup] : "#A79E92" }} />
                      <span className="flex-1 truncate">
                        {ex?.name ?? "—"} — {se.sets.map((set) => `${formatWeight(set.weight)}×${set.reps}`).join(", ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-ink-soft">
        {Object.entries(MUSCLE_GROUP_LABELS).map(([g, label]) => (
          <span key={g} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MUSCLE_GROUP_COLORS[g as keyof typeof MUSCLE_GROUP_COLORS] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
