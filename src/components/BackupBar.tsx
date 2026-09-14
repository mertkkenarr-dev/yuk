import { useRef, useState } from "react";
import type { AppState } from "../types";
import { parseImportedState, triggerBackupDownload } from "../lib/storage";
import { markBackedUp } from "../lib/persistence";

interface Props {
  state: AppState;
  onImport: (state: AppState) => void;
}

export function BackupBar({ state, onImport }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    triggerBackupDownload(state);
    markBackedUp();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseImportedState(text);
      if (!confirm("Bu, mevcut tüm verinin üzerine yazacak. Devam edilsin mi?")) return;
      onImport(imported);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dosya okunamadı.");
    }
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <button onClick={handleExport} className="text-ink-soft hover:text-ink underline underline-offset-2">
        Verini dışa aktar (JSON)
      </button>
      <button onClick={() => fileInput.current?.click()} className="text-ink-soft hover:text-ink underline underline-offset-2">
        İçe aktar
      </button>
      <input ref={fileInput} type="file" accept="application/json" onChange={handleFileChange} className="hidden" />
      {error && <span className="text-power text-xs">{error}</span>}
    </div>
  );
}
