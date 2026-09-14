import { useState } from "react";
import {
  daysSinceLastBackup,
  dismissInstallNudge,
  isInstallNudgeDismissed,
  isStandalone,
  markBackedUp,
} from "../lib/persistence";
import { triggerBackupDownload } from "../lib/storage";
import type { AppState } from "../types";

interface Props {
  state: AppState;
  hasData: boolean;
}

const BACKUP_REMINDER_DAYS = 14;

export function PersistenceBanner({ state, hasData }: Props) {
  const [dismissedInstall, setDismissedInstall] = useState(false);

  if (!hasData) return null;

  const days = daysSinceLastBackup();
  const needsBackup = days === null || days >= BACKUP_REMINDER_DAYS;

  if (needsBackup) {
    return (
      <div className="mb-6 rounded-lg border border-gold/40 bg-gold-soft px-4 py-3 flex items-center justify-between gap-3 text-sm">
        <p className="text-gold">
          {days === null
            ? "Verini hiç yedeklemedin — kaybolursa geri gelmez."
            : `Son yedeğin ${days} gün önceydi. Tarayıcı verisi silinirse antrenman geçmişin gider.`}
        </p>
        <button
          onClick={() => {
            triggerBackupDownload(state);
            markBackedUp();
          }}
          className="shrink-0 px-3 py-1.5 text-xs bg-gold text-bg font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          Şimdi yedekle
        </button>
      </div>
    );
  }

  if (!isStandalone() && !isInstallNudgeDismissed() && !dismissedInstall) {
    return (
      <div className="mb-6 rounded-lg border border-border bg-surface px-4 py-3 flex items-center justify-between gap-3 text-sm">
        <p className="text-ink-soft">
          Bu uygulamayı telefonunda "Ana Ekrana Ekle" ile kurarsan veri kaybı riski belirgin şekilde azalır.
        </p>
        <button
          onClick={() => {
            dismissInstallNudge();
            setDismissedInstall(true);
          }}
          className="shrink-0 text-ink-soft hover:text-ink px-1"
          aria-label="Kapat"
        >
          ×
        </button>
      </div>
    );
  }

  return null;
}
