interface Props {
  totalSessions: number;
  weekStreak: number;
  thisWeekVolume: number;
}

export function StatsHeader({ totalSessions, weekStreak, thisWeekVolume }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      <div className="rounded-xl border border-border bg-surface shadow-sm p-4">
        <p className="text-xs text-ink-soft mb-1">Bu hafta hacim</p>
        <p className="font-display text-2xl bg-gradient-to-br from-power to-gold bg-clip-text text-transparent">
          {Math.round(thisWeekVolume).toLocaleString("tr-TR")}
        </p>
        <p className="text-[10px] text-ink-soft mt-0.5">kg</p>
      </div>
      <div className="rounded-xl border border-border bg-surface shadow-sm p-4">
        <p className="text-xs text-ink-soft mb-1">Haftalık seri</p>
        <p className="font-display text-2xl text-ink">
          {weekStreak}
          <span className="text-sm text-ink-soft ml-1">hafta</span>
        </p>
      </div>
      <div className="rounded-xl border border-border bg-surface shadow-sm p-4">
        <p className="text-xs text-ink-soft mb-1">Toplam antrenman</p>
        <p className="font-display text-2xl text-ink">{totalSessions}</p>
      </div>
    </div>
  );
}
