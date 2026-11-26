"use client";

import React, { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  applyColorScheme,
  getEffectiveColorScheme,
  getSystemColorScheme,
  getThemePreference,
  subscribeThemeChange,
  toggleTwoStateColorScheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

export function NavbarThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [effective, setEffective] = useState<ResolvedTheme>("dark");

  useEffect(() => {
    setMounted(true);
    const sync = () => setEffective(getEffectiveColorScheme());
    sync();
    return subscribeThemeChange(sync);
  }, []);

  const isDark = mounted ? effective === "dark" : true;
  const label = isDark ? "Zum hellen Design wechseln" : "Zum dunklen Design wechseln";

  return (
    <button
      type="button"
      onClick={toggleTwoStateColorScheme}
      title={label}
      aria-label={label}
      className="flex items-center justify-center min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:size-9 rounded-xl bg-card border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition cursor-pointer"
    >
      {mounted ? (
        isDark ? (
          <Sun className="w-4 h-4 text-primary" aria-hidden="true" />
        ) : (
          <Moon className="w-4 h-4 text-foreground" aria-hidden="true" />
        )
      ) : (
        <Sun className="w-4 h-4 opacity-0" aria-hidden="true" />
      )}
    </button>
  );
}

export function ThemeSelector() {
  const [mounted, setMounted] = useState(false);
  const [pref, setPref] = useState<ThemePreference>("system");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("dark");

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      setPref(getThemePreference());
      setSystemTheme(getSystemColorScheme());
    };
    sync();
    return subscribeThemeChange(sync);
  }, []);

  const currentPref: ThemePreference = mounted ? pref : "system";
  const systemLabel = mounted
    ? `System (${systemTheme === "dark" ? "Dunkel" : "Hell"})`
    : "System";

  const options: Array<{
    value: ThemePreference;
    label: string;
    icon: React.ElementType;
  }> = [
    { value: "system", label: systemLabel, icon: Monitor },
    { value: "light", label: "Hell", icon: Sun },
    { value: "dark", label: "Dunkel", icon: Moon },
  ];

  return (
    <div
      role="group"
      aria-label="Farbschema wählen"
      className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-muted border border-border"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = currentPref === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => applyColorScheme(opt.value === "system" ? null : opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              active
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
