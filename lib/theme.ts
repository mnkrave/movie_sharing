export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const COLOR_SCHEME_STORAGE_KEY = "color-scheme";
const THEME_CHANGE_EVENT = "cinecircle-theme-change";

export function getStoredColorScheme(): "light" | "dark" | null {
  if (typeof window === "undefined") return null;
  try {
    const val = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
    if (val === "light" || val === "dark") return val;
  } catch {
    // Ignore storage access errors
  }
  return null;
}

export function getSystemColorScheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getEffectiveColorScheme(): ResolvedTheme {
  return getStoredColorScheme() ?? getSystemColorScheme();
}

export function getThemePreference(): ThemePreference {
  return getStoredColorScheme() ?? "system";
}

export function applyColorScheme(scheme: "light" | "dark" | null): void {
  if (typeof document !== "undefined") {
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute("content", scheme ?? "light dark");
    }
  }
  if (typeof window !== "undefined") {
    try {
      if (scheme === null) {
        window.localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
      } else {
        window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
      }
    } catch {
      // Ignore storage access errors
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }
}

export function toggleTwoStateColorScheme(): void {
  const target: ResolvedTheme = getEffectiveColorScheme() === "dark" ? "light" : "dark";
  const system = getSystemColorScheme();
  // When target matches current OS preference, remove stored value so OS changes stay tracked
  if (target === system) {
    applyColorScheme(null);
  } else {
    applyColorScheme(target);
  }
}

export function subscribeThemeChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const onStorage = (e: StorageEvent) => {
    if (e.key === COLOR_SCHEME_STORAGE_KEY || e.key === null) cb();
  };
  window.addEventListener(THEME_CHANGE_EVENT, cb);
  window.addEventListener("storage", onStorage);
  mql.addEventListener("change", cb);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, cb);
    window.removeEventListener("storage", onStorage);
    mql.removeEventListener("change", cb);
  };
}
