const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4100/api";
const ORIGIN = API_BASE.replace(/\/api\/?$/, "");

export function assetUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  return `${ORIGIN}${path}`;
}
