export interface GameResults {
  beforeTimeSec: number;
  beforeErrors: number;
  afterTimeSec: number;
  afterErrors: number;
  cluesFound: string[];
  repairsCompleted: string[];
  completedAt: string;
}

const STORAGE_KEY = 'friction_arcade_results';
const PREFS_KEY = 'friction_arcade_prefs';

export interface UserPrefs {
  skip3D: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

export function saveGameResults(results: GameResults): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch {
    // LocalStorage might be disabled or in private mode; silently continue
  }
}

export function loadGameResults(): GameResults | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUserPrefs(prefs: Partial<UserPrefs>): void {
  try {
    const current = loadUserPrefs();
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
  } catch {
    // Ignore
  }
}

export function loadUserPrefs(): UserPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore
  }
  return {
    skip3D: false,
    reducedMotion: typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
    highContrast: false,
  };
}

export function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
