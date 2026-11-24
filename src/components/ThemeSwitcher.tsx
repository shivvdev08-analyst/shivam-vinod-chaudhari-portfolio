"use client";
import { useEffect, useState } from "react";
import { themes, type ThemeId } from "@/data/portfolio";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>("aurora");
  useEffect(() => {
    const saved = localStorage.getItem("portfolio-theme") as ThemeId | null;
    const t = saved && themes.some((x) => x.id === saved) ? saved : "aurora";
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);
  const pick = (id: ThemeId) => {
    setTheme(id);
    document.documentElement.setAttribute("data-theme", id);
    localStorage.setItem("portfolio-theme", id);
  };
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Colour theme">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => pick(t.id)}
          aria-pressed={theme === t.id}
          className="chip"
          style={theme === t.id ? { borderColor: "var(--accent)", color: "var(--text)" } : undefined}
          title={t.hint}
        >
          {t.name}
        </button>
      ))}
    </div>
  );
}
