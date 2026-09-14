import type { HeatDay } from "../lib/calc";

interface Props {
  days: HeatDay[];
}

const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function StreakHeatmap({ days }: Props) {
  const first = new Date(days[0].date);
  const leadingEmpty = (first.getDay() + 6) % 7;
  const padded: (HeatDay | null)[] = [...Array(leadingEmpty).fill(null), ...days];

  const weeks: (HeatDay | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  const today = days[days.length - 1]?.date;

  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-wide text-ink-soft mb-3">Son {days.length} gün</p>
      <div className="rounded-xl border border-border bg-surface shadow-sm p-4 overflow-x-auto">
        <div className="flex gap-4">
          <div className="flex flex-col gap-1">
            {DAY_LABELS.map((d, i) => (
              <div key={d} className="h-3.5 text-[10px] text-ink-soft flex items-center">
                {i % 2 === 0 ? d : ""}
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) =>
                  day ? (
                    <div
                      key={di}
                      title={new Date(day.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
                      className="w-3.5 h-3.5 rounded-sm hover:scale-125 transition-transform"
                      style={{
                        backgroundColor: day.hasSession ? "#FF4D2E" : "#362F27",
                        outline: day.date === today ? "1.5px solid #FFC24D" : undefined,
                        outlineOffset: 1,
                      }}
                    />
                  ) : (
                    <div key={di} className="w-3.5 h-3.5" />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
