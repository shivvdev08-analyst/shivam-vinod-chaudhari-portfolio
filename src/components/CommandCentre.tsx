"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { projects, skillGroups, memories } from "@/data/portfolio";
import { openAstraChat } from "@/components/AstraOrb";

const stages = [
  {
    id: "perceive",
    label: "Perceive",
    verb: "See & read the world",
    project: "VERITAS",
    detail:
      "VERITAS turns scanned, messy documents into structured knowledge — EasyOCR reads the page, Sentence Transformers (MiniLM, 384-dim) embed it, pgvector makes it searchable.",
    href: "/projects/veritas",
    linkLabel: "Open the VERITAS case study →",
  },
  {
    id: "reason",
    label: "Reason",
    verb: "Plan the next step",
    project: "NOVA Agent · AgentForge",
    detail:
      "NOVA Agent is the planner in design: breaking a goal into steps, delegating to specialised agents, and keeping long-running work on track with LangGraph-style state.",
    href: "#lab",
    linkLabel: "See it on the AgentForge map →",
  },
  {
    id: "act",
    label: "Act",
    verb: "Speak & ship",
    project: "ASTRA",
    detail:
      "ASTRA is the voice-first interface — Whisper hears you, local models via Ollama respond, PySide6 puts it on the desktop. SplitSage AI proves the forge ships finished products.",
    href: "/projects/astra",
    linkLabel: "Open the ASTRA case study →",
  },
  {
    id: "evaluate",
    label: "Evaluate",
    verb: "Judge & repair",
    project: "SafeGen AI",
    detail:
      "SafeGen AI closes the loop: every output is generated, judged for hallucination and safety risk, then repaired before it reaches a person. Try it live in the AI Lab.",
    href: "/projects/safegen-ai",
    linkLabel: "Open the SafeGen AI case study →",
  },
];

/** Animated counter: counts up from zero the first time it mounts. */
function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{shown}</>;
}

/**
 * Neural Command Centre — the four-stage pipeline from the Muse portfolio.
 * Auto-advances Perceive → Reason → Act → Evaluate until the visitor picks
 * a stage themselves, and shows a board of real counts computed from this
 * site's own published content. Nothing here is a vanity metric.
 */
export default function CommandCentre() {
  const [activeId, setActiveId] = useState(stages[0].id);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (touched) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      setActiveId((cur) => {
        const i = stages.findIndex((s) => s.id === cur);
        return stages[(i + 1) % stages.length]!.id;
      });
    }, 3800);
    return () => clearInterval(t);
  }, [touched]);
  const active = stages.find((s) => s.id === activeId) ?? stages[0]!;
  const inDev = projects.filter((x) => x.status === "in-development" || x.status === "research");
  const stats = [
    { label: "Systems published", value: projects.length },
    { label: "In active development", value: inDev.length },
    { label: "Technologies in the stack", value: skillGroups.reduce((n, g) => n + g.skills.length, 0) },
    { label: "Memories on the wall", value: memories.length },
  ];
  return (
    <section id="command-centre" aria-label="Neural command centre" className="card scroll-mt-24 p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Neural Command Centre</p>
          <h3 className="section-title mt-1">How I build AI: one loop, four moves.</h3>
        </div>
        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          <span aria-hidden="true">● </span>System live
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="Choose a pipeline stage">
          {stages.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setTouched(true);
                setActiveId(s.id);
              }}
              aria-pressed={active.id === s.id}
              className="rounded-2xl border px-3 py-4 text-center"
              style={
                active.id === s.id
                  ? { borderColor: "var(--accent)", background: "var(--surface2)" }
                  : { borderColor: "var(--border)" }
              }
            >
              <span
                aria-hidden="true"
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-extrabold"
                style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-3 block text-[15px] font-bold">{s.label}</span>
              <span className="mt-0.5 block text-[11px] leading-tight" style={{ color: "var(--muted)" }}>
                {s.verb}
              </span>
            </button>
          ))}
        </div>

        {/* Auto-cycle progress: a bar that fills across each 3.8s stage so the
            loop is visibly running, plus a way back into auto-play after a
            visitor takes control by tapping a stage. */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full" style={{ background: "var(--border)" }} aria-hidden="true">
            {!touched ? (
              <div key={active.id} className="cc-progress-bar h-full w-full rounded-full" style={{ background: "var(--accent)" }} />
            ) : (
              <div className="h-full w-full rounded-full opacity-40" style={{ background: "var(--accent)" }} />
            )}
          </div>
          <p className="shrink-0 text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
            Stage {stages.findIndex((s) => s.id === active.id) + 1} / {stages.length}
            {!touched ? " · auto-cycling" : ""}
          </p>
          {touched && (
            <button
              type="button"
              onClick={() => setTouched(false)}
              className="shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
              aria-label="Resume automatic cycling of the command centre stages"
            >
              ▶ Resume auto-cycle
            </button>
          )}
        </div>

        <div key={active.id} className="stage-in border-t pt-5" style={{ borderColor: "var(--border)" }} aria-live="polite">
          <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent)" }}>
            Stage · {active.label} — {active.project}
          </p>
          <p className="mt-2 leading-7" style={{ color: "var(--muted)" }}>
            {active.detail}
          </p>
          {active.href.startsWith("/") ? (
            <Link href={active.href} className="mt-3 inline-block text-sm font-semibold">
              {active.linkLabel}
            </Link>
          ) : (
            <a href={active.href} className="mt-3 inline-block text-sm font-semibold">
              {active.linkLabel}
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((st) => (
            <div key={st.label} className="rounded-2xl border p-4" style={{ borderColor: "var(--border)" }}>
              <p className="text-3xl font-extrabold" style={{ color: "var(--accent)" }}>
                <CountUp value={st.value} />
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                {st.label}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border p-5" style={{ borderColor: "var(--border)" }}>
          <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            Try the system, don&apos;t just read it
          </p>
          <div className="mt-3 space-y-2">
            <a href="#lab" className="btn block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold">
              ⚗ Run SafeGen live — Generate → Judge → Repair
            </a>
            <a href="#lab" className="btn-ghost block w-full rounded-xl px-4 py-3 text-left text-sm font-medium">
              ◈ Explore the AgentForge system map
            </a>
            <button
              type="button"
              onClick={openAstraChat}
              aria-label="Open ASTRA chat and ask about any project"
              className="btn-ghost block w-full rounded-xl border-dashed px-4 py-3 text-left text-sm"
            >
              ◉ Ask <strong>ASTRA</strong> — open the chat and ask about any project →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
