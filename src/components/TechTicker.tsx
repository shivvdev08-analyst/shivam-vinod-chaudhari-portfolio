"use client";

/**
 * Tech ticker band: the real stack streaming right-to-left in an endless
 * loop, directly above the Neural Command Centre. FastAPI, PostgreSQL and
 * pgvector lead — they power VERITAS — followed by every other published
 * skill, deduplicated. Pure CSS animation, so it runs identically in the
 * Muse app and in this static export.
 */
import { skillGroups } from "@/data/portfolio";

const TICKER_LEAD = ["FastAPI", "PostgreSQL", "pgvector"];

export default function TechTicker() {
  const stream: string[] = [];
  const allSkills = skillGroups.flatMap((g) => g.skills);
  for (const s of [...TICKER_LEAD, ...allSkills]) {
    if (!stream.some((x) => x.toLowerCase() === s.toLowerCase())) stream.push(s);
  }
  return (
    <div className="border-y" style={{ borderColor: "var(--border)", background: "var(--bg2)" }} aria-label={`Technology stack: ${stream.join(", ")}`}>
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <span className="hidden shrink-0 items-center gap-2 text-[10px] uppercase tracking-[0.25em] sm:flex" style={{ color: "var(--accent)" }}>
          <span aria-hidden="true" className="anim-blink h-1.5 w-1.5 rounded-full" style={{ background: "var(--a3)" }} />
          Live stack
        </span>
        <div className="tech-ticker min-w-0 flex-1">
          <div className="tech-ticker-track gap-10" aria-hidden="true">
            {[...stream, ...stream].map((sk, i) => (
              <span key={`${sk}-${i}`} className="whitespace-nowrap text-xs uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                {sk} <span className="ml-8" style={{ color: "var(--accent)" }}>◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
