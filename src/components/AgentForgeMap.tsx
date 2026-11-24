/** AgentForge System Map — centre AgentForge; SafeGen, ASTRA, NOVA, SplitSage nodes; planned outer ring. VERITAS is deliberately excluded: it is a separate MCA capstone. */
const nodes = [
  { name: "SafeGen AI", detail: "LLM evaluation · Generate → Judge → Repair", state: "In progress" },
  { name: "ASTRA", detail: "Personal AI companion · voice-first, Ollama", state: "In development" },
  { name: "NOVA Agent", detail: "Agent reasoning · Python / LangGraph / CrewAI", state: "Planning" },
  { name: "SplitSage AI", detail: "MVP completed · Next.js / Express / PostgreSQL / Prisma / OCR / Groq", state: "MVP completed" },
];

export default function AgentForgeMap() {
  return (
    <div className="card p-5">
      <p className="eyebrow">AgentForge System Map</p>
      <h3 className="section-title mt-1">AgentForge</h3>
      <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
        The AgentForge ecosystem from my GitHub profile. VERITAS is a separate MCA capstone and is not part of this map.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {nodes.map((n) => (
          <div key={n.name} className="rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>
            <p className="font-bold">{n.name}</p>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{n.detail}</p>
            <p className="chip mt-3 inline-block">{n.state}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>Planned outer ring: future AgentForge agents, to be added only when they exist.</p>
    </div>
  );
}
