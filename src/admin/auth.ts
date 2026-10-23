// Client-side PIN gate. This is an easter-egg lock, not real security: the PIN hash ships
// with the site. What actually protects content is the GitHub token needed to publish.

const SESSION_KEY = "coh_admin_session";
const ATTEMPTS_KEY = "coh_admin_attempts";
const TOKEN_KEY = "coh_github_token";
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60_000;

export async function hashPin(pin: string) {
  const bytes = new TextEncoder().encode(`cupofhope:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function read<T>(storage: () => Storage, key: string, fallback: T): T {
  try {
    const raw = storage().getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(storage: () => Storage, key: string, value: unknown) {
  try {
    if (value === null) storage().removeItem(key);
    else storage().setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) */
  }
}

const local = () => window.localStorage;
const session = () => window.sessionStorage;

export const isUnlocked = () => read(session, SESSION_KEY, false);
export const lock = () => write(session, SESSION_KEY, null);

type Attempts = { count: number; lockedUntil: number };

/** Milliseconds until the PIN pad unlocks again, 0 when it can be used. */
export function lockRemaining() {
  const a = read<Attempts>(local, ATTEMPTS_KEY, { count: 0, lockedUntil: 0 });
  return Math.max(0, a.lockedUntil - Date.now());
}

export async function tryPin(pin: string, expectedHash: string): Promise<"ok" | "wrong" | "locked"> {
  if (lockRemaining() > 0) return "locked";
  if ((await hashPin(pin)) === expectedHash) {
    write(local, ATTEMPTS_KEY, null);
    write(session, SESSION_KEY, true);
    return "ok";
  }
  const a = read<Attempts>(local, ATTEMPTS_KEY, { count: 0, lockedUntil: 0 });
  const count = a.count + 1;
  write(local, ATTEMPTS_KEY, count >= MAX_ATTEMPTS ? { count: 0, lockedUntil: Date.now() + LOCK_MS } : { count, lockedUntil: 0 });
  return count >= MAX_ATTEMPTS ? "locked" : "wrong";
}

export const getToken = () => read<string>(local, TOKEN_KEY, "");
export const setToken = (token: string) => write(local, TOKEN_KEY, token || null);
