import { useEffect } from "react";
import type { PRHit } from "../lib/calc";
import { formatWeight } from "../lib/calc";

interface Props {
  hits: PRHit[];
  exerciseName: string;
  onDismiss: () => void;
}

const LABELS: Record<PRHit["type"], (h: PRHit) => string> = {
  weight: (h) => `Yeni ağırlık rekoru: ${formatWeight(h.value)} kg`,
  reps: (h) => `Yeni tekrar rekoru: ${h.value} tekrar`,
  "1rm": (h) => `Yeni tahmini 1RM rekoru: ${formatWeight(h.value)} kg`,
};

export function PRBanner({ hits, exerciseName, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  if (hits.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto max-w-sm w-full rounded-xl border border-power/40 bg-power-soft shadow-lg p-4 animate-[fadeIn_0.3s_ease]">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none">🏆</span>
          <div className="flex-1">
            <p className="font-display text-sm text-power mb-1">YENİ REKOR — {exerciseName}</p>
            {hits.map((h, i) => (
              <p key={i} className="text-sm text-ink">
                {LABELS[h.type](h)}
              </p>
            ))}
          </div>
          <button onClick={onDismiss} className="text-ink-soft hover:text-ink text-sm px-1">
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
