const RECENTS_KEY = "scanview:recentScans";
const MAX_RECENTS = 20;

// Phase 1 has no backend, so "recent scans" is just local browsing history
// of scan attempts on this device/browser - not a synced or durable record.
// Captured images themselves are not persisted here (they're in-memory
// blobs), only the metadata needed to show a history list.
export function getRecentScans() {
  const raw = localStorage.getItem(RECENTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addRecentScan(entry) {
  const existing = getRecentScans();
  const next = [entry, ...existing.filter((e) => e.id !== entry.id)].slice(0, MAX_RECENTS);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  return next;
}
