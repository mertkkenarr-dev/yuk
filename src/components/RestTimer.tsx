import { useEffect, useState } from "react";

interface Props {
  seconds: number;
  onDismiss: () => void;
}

export function RestTimer({ seconds, onDismiss }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const done = remaining <= 0;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, done]);

  useEffect(() => {
    if (!done) return;
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [done, onDismiss]);

  const mm = Math.floor(Math.max(remaining, 0) / 60);
  const ss = Math.max(remaining, 0) % 60;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center gap-4 rounded-full border shadow-lg px-5 py-3 ${
          done ? "border-power bg-power-soft" : "border-border bg-surface"
        }`}
      >
        <span className={`font-display text-2xl tabular-nums ${done ? "text-power" : "text-ink"}`}>
          {done ? "BİTTİ" : `${mm}:${String(ss).padStart(2, "0")}`}
        </span>
        {!done && (
          <button onClick={() => setRemaining((r) => r + 15)} className="text-xs text-ink-soft hover:text-ink px-2 py-1 rounded-md border border-border">
            +15sn
          </button>
        )}
        <button onClick={onDismiss} className="text-ink-soft hover:text-ink text-sm px-1">
          ×
        </button>
      </div>
    </div>
  );
}
