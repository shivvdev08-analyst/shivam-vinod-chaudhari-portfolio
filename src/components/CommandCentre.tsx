"use client";
import { useState } from "react";

const stages = [
  { id: "perceive", label: "Perceive", project: "VERITAS", detail: "Documents in — OCR (EasyOCR), chunking, MiniLM 384-dim embeddings into PostgreSQL / pgvector." },
  { id: "reason", label: "Reason", project: "NOVA Agent", detail: "Planned agent reasoning layer in the AgentForge ecosystem (Python / LangGraph / CrewAI) — planning stage, not claimed as built." },
  { id: "act", label: "Act", project: "ASTRA", detail: "Voice-first personal AI companion, in development — local AI via Ollama, application launching, long-term memory." },
  { id: "evaluate", label: "Evaluate", project: "SafeGen AI", detail: "Generate → Judge → Repair: rule-based + LLM-as-a-judge evaluation, then safer corrected responses. No benchmark results published yet." },
];

/** Neural Command Centre — the four-stage pipeline from v5. */
export default function CommandCentre() {
  const [active, setActive] = useState(stages[0]);
  return (
    <div className="card p-5">
      <p className="eyebrow">Neural Command Centre</p>
      <h3 className="section-title mt-1">Perceive → Reason → Act → Evaluate</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {stages.map((s) => (
          <button key={s.id} onClick={() => setActive(s)} className="chip" aria-pressed={active.id === s.id}
            style={active.id === s.id ? { borderColor: "var(--accent)", color: "var(--text)" } : undefined}>
            {s.label} · {s.project}
          </button>
        ))}
      </div>
      <p className="mt-4" style={{ color: "var(--muted)" }}>{active.detail}</p>
    </div>
  );
}
