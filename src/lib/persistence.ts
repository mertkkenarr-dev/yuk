const META_KEY = "yuk-persistence-meta-v1";

interface PersistenceMeta {
  lastBackupAt?: number;
  installNudgeDismissedAt?: number;
}

function loadMeta(): PersistenceMeta {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveMeta(meta: PersistenceMeta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

/** Asks the browser not to auto-evict this site's storage under disk pressure. Silently a no-op if unsupported. */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist) await navigator.storage.persist();
  } catch {
    // Best-effort only — ignore failures (unsupported browser, denied, etc).
  }
}

export function markBackedUp(): void {
  saveMeta({ ...loadMeta(), lastBackupAt: Date.now() });
}

export function daysSinceLastBackup(): number | null {
  const at = loadMeta().lastBackupAt;
  return at ? Math.floor((Date.now() - at) / 86_400_000) : null;
}

export function isStandalone(): boolean {
  return window.matchMedia?.("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

export function isInstallNudgeDismissed(): boolean {
  const at = loadMeta().installNudgeDismissedAt;
  if (!at) return false;
  return Date.now() - at < 30 * 86_400_000; // re-show after 30 days
}

export function dismissInstallNudge(): void {
  saveMeta({ ...loadMeta(), installNudgeDismissedAt: Date.now() });
}
