const CONFIG_KEY = "scanview:pendingScanConfig";

// Short-lived handoff between the ObjectSetup and CaptureSession pages.
// sessionStorage (not localStorage) since this is only meant to survive
// a page within one tab's scan attempt, not persist across visits.
export function savePendingScanConfig(config) {
  sessionStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function loadPendingScanConfig() {
  const raw = sessionStorage.getItem(CONFIG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPendingScanConfig() {
  sessionStorage.removeItem(CONFIG_KEY);
}
