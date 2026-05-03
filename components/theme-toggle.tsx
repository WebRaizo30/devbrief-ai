"use client";

import * as React from "react";
import { useTheme } from "next-themes";

function NeoSunGlyph() {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" strokeWidth={2} strokeLinecap="square" />
      <path
        strokeWidth={2}
        strokeLinecap="square"
        d="M12 2v4M12 18v4M2 12h4M18 12h5M6.34 6.34l2.83 2.83M14.83 17.83l2.83 2.83M17.66 6.34l-2.83 2.83M9.17 17.83l-2.83 2.83"
      />
    </svg>
  );
}

function NeoMoonGlyph() {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" aria-hidden>
      <path
        strokeWidth={2}
        strokeLinecap="square"
        strokeLinejoin="round"
        d="M21 13.03A9 9 0 1112 3a9.01 9.01 0 009 10.03z"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="neo-toggle-skel h-[54px] w-[172px] shrink-0 rounded-sm"
        aria-hidden
      />
    );
  }

  const active = resolvedTheme ?? theme;

  return (
    <div role="group" aria-label="Tema rengi" className="neo-theme-wrap shrink-0">
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={active === "light"}
        className={`neo-segment-alt ${active === "light" ? "neo-segment-active" : ""}`}
      >
        <span className="neo-theme-icon" aria-hidden>
          <NeoSunGlyph />
        </span>
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={active === "dark"}
        className={`neo-segment-alt ${active === "dark" ? "neo-segment-active" : ""}`}
      >
        <span className="neo-theme-icon" aria-hidden>
          <NeoMoonGlyph />
        </span>
        Dark
      </button>
    </div>
  );
}
