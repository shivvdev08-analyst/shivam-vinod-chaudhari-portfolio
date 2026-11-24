"use client";
import { useState } from "react";
import Link from "next/link";

type ForgeNode = {
  id: string;
  name: string;
  status: string;
  role: string;
  blurb: string;
  detail: string;
  connection: string;
  stack: string[];
  slug: string;
  x: number;
  y: number;
};

/**
 * AgentForge System Map — the ecosystem exactly as Shivam defines it.
 * VERITAS is NOT part of AgentForge — it is his separate MCA capstone, so it
 * never appears on this map. Tap any node to see its role; the planned outer
 * ring is labelled planned on purpose.
 */
const FORGE_CORE: ForgeNode[] = [
  {
    id: "safegen",
    name: "SafeGen AI",
    status: "Building",
    role: "Safety layer",
    blurb: "AI evaluation / LLM safety",
    detail:
      "Generate → Judge → Repair. Every output the system produces passes through SafeGen's evaluation loop — checked for hallucinations, safety risks and policy violations, and repaired before it reaches a user.",
    connection:
      "SafeGen is the safety layer for the whole forge: ASTRA's replies, NOVA's plans and future agents' outputs all pass its Generate → Judge → Repair checks.",
    stack: ["Python", "LLM-as-a-Judge", "Rule-Based Validation"],
    slug: "safegen-ai",
    x: 50,
    y: 15,
  },
  {
    id: "astra",
    name: "ASTRA",
    status: "Active Development",
    role: "Interface",
    blurb: "Voice companion",
    detail:
      "The voice-first interface of the forge — how a person actually talks to the system. Speech in, understanding and action out, running on local models through Ollama.",
    connection:
      "ASTRA is the interface: it takes NOVA's plans and SafeGen-checked responses and turns them into a conversation you can simply speak to.",
    stack: ["Python", "Whisper", "Ollama", "PySide6"],
    slug: "astra",
    x: 85,
    y: 50,
  },
  {
    id: "splitsage",
    name: "SplitSage AI",
    status: "MVP Completed",
    role: "Shipped product",
    blurb: "Expense intelligence",
    detail:
      "Proof the forge ships real products: a completed MVP that reads receipts with OCR and turns shared expenses into clear, settled splits with LLM intelligence.",
    connection:
      "SplitSage is the shipped product: the forge's proof that this ecosystem produces finished, useful software — an MVP already completed.",
    stack: ["Next.js", "Express", "PostgreSQL", "Prisma", "OCR", "Groq"],
    slug: "",
    x: 50,
    y: 85,
  },
  {
    id: "nova",
    name: "NOVA Agent",
    status: "Planning",
    role: "Planner",
    blurb: "Autonomous planning",
    detail:
      "The planner of the system — an autonomous agent that breaks goals into steps, delegates to the other agents, and keeps long-running work on track.",
    connection:
      "NOVA is the planner: it will coordinate ASTRA's interface, SplitSage-style tools and the planned agents — with SafeGen judging its plans before they run.",
    stack: ["Python", "LangGraph", "CrewAI"],
    slug: "",
    x: 15,
    y: 50,
  },
];

const FORGE_PLANNED = [
  { name: "Browser Agent", x: 50, y: 4 },
  { name: "Research Agent", x: 76, y: 13 },
  { name: "Email Agent", x: 85, y: 32 },
  { name: "Memory Engine", x: 85, y: 68 },
  { name: "Vision Agent", x: 76, y: 87 },
  { name: "AgentOS", x: 50, y: 96 },
  { name: "Agent SDK", x: 24, y: 87 },
  { name: "AI Playground", x: 15, y: 68 },
];

export default function AgentForgeMap() {
  const [selectedId, setSelectedId] = useState<string>("safegen");
  const [plannedName, setPlannedName] = useState<string>("");
  const selected = FORGE_CORE.find((n) => n.id === selectedId) ?? FORGE_CORE[0]!;

  return (
    <div className="card p-5">
      <p className="eyebrow">AgentForge System Map</p>
      <h3 className="section-title mt-1">One forge. Every agent connected.</h3>
      <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
        AgentForge is the ecosystem Shivam is building toward an AI Operating System: specialised agents
        that plan, speak, work and check each other — as one system, not scattered experiments. Tap any
        node to see its role. (VERITAS, his MCA capstone, is a separate academic project and deliberately
        not part of this map.)
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* The map */}
        <div className="relative overflow-hidden rounded-3xl border px-2 py-4" style={{ borderColor: "var(--border)" }}>
          <div className="relative mx-auto aspect-[4/3.4] w-full max-w-[560px] sm:aspect-square">
            <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {FORGE_CORE.map((n) => (
                <line key={n.id} x1="50" y1="50" x2={n.x} y2={n.y} stroke="var(--accent)" strokeOpacity={selectedId === n.id ? 0.8 : 0.3} strokeWidth={selectedId === n.id ? 0.55 : 0.35} className="forge-line-flow" />
              ))}
              {FORGE_PLANNED.map((n) => (
                <line key={n.name} x1="50" y1="50" x2={n.x} y2={n.y} stroke="var(--muted)" strokeOpacity="0.14" strokeWidth="0.25" strokeDasharray="1.5 1.5" />
              ))}
              <circle cx="50" cy="50" r="30" fill="none" stroke="var(--accent)" strokeOpacity="0.18" strokeWidth="0.3" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="var(--muted)" strokeOpacity="0.14" strokeWidth="0.3" strokeDasharray="2 2" />
            </svg>

            <button
              type="button"
              aria-label="AgentForge — the centre of the system"
              onClick={() => {
                setSelectedId("");
                setPlannedName("");
              }}
              className="forge-core absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 text-center sm:h-28 sm:w-28"
              style={{ borderColor: "var(--accent)", background: "var(--bg)" }}
            >
              <span className="text-[13px] font-extrabold leading-tight sm:text-sm">
                AGENT
                <br />
                FORGE
              </span>
              <span className="mt-1 text-[8px] uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                AI OS vision
              </span>
            </button>

            {FORGE_CORE.map((n, ni) => (
              <button
                key={n.id}
                type="button"
                aria-label={`${n.name} — ${n.status}`}
                aria-pressed={selectedId === n.id}
                onClick={() => {
                  setSelectedId(n.id);
                  setPlannedName("");
                }}
                className="forge-node-float absolute flex w-[104px] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-2xl border px-2 py-2.5 text-center transition sm:w-[128px]"
                style={{
                  left: `${n.x}%`,
                  top: `${n.y}%`,
                  animationDelay: `${ni * 1.1}s`,
                  borderColor: selectedId === n.id ? "var(--accent)" : "var(--border)",
                  background: "var(--surface)",
                }}
              >
                <span className="text-[12px] font-bold leading-tight sm:text-[13px]">{n.name}</span>
                <span className="mt-1 text-[8.5px] uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                  {n.status}
                </span>
                <span className="mt-0.5 hidden text-[10px] leading-tight sm:block" style={{ color: "var(--muted)" }}>
                  {n.blurb}
                </span>
              </button>
            ))}

            {FORGE_PLANNED.map((n) => (
              <button
                key={n.name}
                type="button"
                aria-label={`${n.name} — planned`}
                aria-pressed={plannedName === n.name}
                onClick={() => {
                  setPlannedName(n.name);
                  setSelectedId("");
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-2 py-1 text-[8.5px] uppercase tracking-widest transition sm:text-[9.5px]"
                style={{
                  left: `${n.x}%`,
                  top: `${n.y}%`,
                  borderColor: "var(--border)",
                  color: plannedName === n.name ? "var(--text)" : "var(--muted)",
                  opacity: plannedName === n.name ? 0.9 : 0.55,
                }}
              >
                {n.name}
              </button>
            ))}
          </div>
          <p className="pb-1 text-center text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
            Inner ring · building now — Outer ring · planned
          </p>
          {/* Big tappable selectors — the map nodes are small on phones, so
              these full-width controls guarantee every system is reachable. */}
          <div className="grid grid-cols-2 gap-2 px-3 pb-3 pt-1" role="group" aria-label="Select a system in the forge">
            {FORGE_CORE.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setSelectedId(n.id);
                  setPlannedName("");
                }}
                aria-pressed={selectedId === n.id}
                className="rounded-xl border px-3 py-2.5 text-left text-sm transition"
                style={{
                  borderColor: selectedId === n.id ? "var(--accent)" : "var(--border)",
                  color: selectedId === n.id ? "var(--text)" : "var(--muted)",
                }}
              >
                {n.name}
                <span className="block text-[10px] uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                  {n.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div key={plannedName || selectedId || "core"} className="stage-in h-fit rounded-3xl border p-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }} aria-live="polite">
          {plannedName ? (
            <>
              <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                Planned · AgentForge roadmap
              </p>
              <h3 className="mt-2 text-2xl font-bold">{plannedName}</h3>
              <p className="mt-3 leading-7" style={{ color: "var(--muted)" }}>
                {plannedName} is on the AgentForge roadmap — part of the outer ring planned as the system
                grows toward an AI Operating System. It isn&apos;t in development yet, and this map labels
                it that way on purpose.
              </p>
              <button
                type="button"
                className="mt-5 rounded-xl border px-5 py-2.5 text-sm font-medium"
                style={{ borderColor: "var(--border)" }}
                onClick={() => setPlannedName("")}
              >
                Back to the core systems
              </button>
            </>
          ) : selectedId === "" ? (
            <>
              <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                The Vision
              </p>
              <h3 className="mt-2 text-2xl font-bold">AgentForge — an AI Operating System, forged piece by piece.</h3>
              <p className="mt-3 leading-7" style={{ color: "var(--muted)" }}>
                Four systems are already in the forge: a safety layer (SafeGen AI), a voice interface
                (ASTRA), a planner (NOVA Agent) and a shipped product (SplitSage AI). Around them, a
                planned ring — Browser Agent, Research Agent, Email Agent, Memory Engine, Vision Agent,
                AgentOS, Agent SDK and an AI Playground — waits its turn. Select any node to inspect it.
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
                  {selected.status}
                </span>
                <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  {selected.role}
                </span>
              </div>
              <h3 className="mt-3 text-2xl font-bold">{selected.name}</h3>
              <p className="mt-1 text-sm italic" style={{ color: "var(--muted)" }}>
                {selected.blurb}
              </p>
              <p className="mt-3 leading-7" style={{ color: "var(--muted)" }}>
                {selected.detail}
              </p>
              <h4 className="mt-5 text-sm font-semibold">How it connects</h4>
              <p className="mt-1 text-sm leading-6" style={{ color: "var(--muted)" }}>
                {selected.connection}
              </p>
              <h4 className="mt-5 text-sm font-semibold">Tech stack</h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.stack.map((t) => (
                  <span key={t} className="rounded px-2.5 py-1 text-[11px]" style={{ background: "var(--surface2)" }}>
                    {t}
                  </span>
                ))}
              </div>
              {selected.slug ? (
                <Link href={`/projects/${selected.slug}`} className="btn mt-6 inline-block rounded-xl px-5 py-2.5 font-semibold">
                  Open the {selected.name} case study →
                </Link>
              ) : (
                <p className="mt-6 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                  {selected.id === "nova"
                    ? "NOVA is in planning — its full case study will be published here as the design firms up."
                    : "SplitSage AI's MVP is complete; Shivam is documenting its full case study for the Projects section."}
                </p>
              )}
              {selected.id === "safegen" && (
                <a href="#lab" className="btn-ghost mt-3 block w-full rounded-xl px-5 py-3 text-left text-sm font-semibold">
                  ⚗ Don&apos;t just read it — run SafeGen live in the AI Lab →
                </a>
              )}
              {selected.id === "astra" && (
                <a href="#astra" className="btn-ghost mt-3 block w-full rounded-xl px-5 py-3 text-left text-sm font-semibold">
                  ◉ Ask ASTRA — see the verified answers →
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
