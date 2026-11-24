"use client";
import { useEffect, useRef, useState } from "react";
import {
  profile, projects, skillGroups, education, experience, achievements,
  type Project,
} from "@/data/portfolio";

/** Anywhere on the site can open the ASTRA chat by firing this event. */
export function openAstraChat() {
  try {
    window.dispatchEvent(new CustomEvent("astra:open"));
  } catch {
    // best-effort; the orb itself always works.
  }
}

type Msg = { role: "user" | "astra"; text: string; sources?: string[] };

const SUGGESTIONS = [
  "Who is Shivam?",
  "Explain the VERITAS project",
  "What technologies does Shivam use?",
  "Does he have Data Science internship experience?",
  "Has he won any hackathons?",
  "How can I contact him?",
];

/**
 * On-device ASTRA answers. This static export has no server, so the orb
 * answers strictly from the same published portfolio data the page itself
 * loaded (profile, projects, skills, timeline, achievements) — never from
 * general knowledge about the world. Returns null when the question is
 * outside that data.
 */
export function localAstraAnswer(question: string): { text: string; sources: string[] } | null {
  const q = question.toLowerCase();
  const p = profile;
  const has = (...words: string[]) => words.some((w) => q.includes(w));
  const bySlug = (slug: string) => projects.find((x) => x.slug === slug);
  const projectAnswer = (proj: Project) => ({
    text: `${proj.title} — ${proj.tagline}\n\n${proj.simpleSummary}${proj.stack.length ? `\n\nStack: ${proj.stack.join(", ")}.` : ""}\nStatus: ${proj.status.replace("-", " ")}.`,
    sources: [`Project: ${proj.title}`],
  });

  if (has("veritas")) {
    const v = bySlug("veritas");
    if (v) return projectAnswer(v);
  }
  if (has("safegen", "safe gen")) {
    const v = bySlug("safegen-ai");
    if (v) return projectAnswer(v);
  }
  if (has("agentforge", "agent forge", "agentos")) {
    return {
      text: "AgentForge is the ecosystem Shivam is building toward an AI Operating System: SafeGen AI is the safety layer (Generate → Judge → Repair), ASTRA is the voice interface, NOVA Agent is the planner (in planning), and SplitSage AI is the shipped product (MVP completed). VERITAS is his separate MCA capstone and is not part of AgentForge. You can explore the interactive map on the AgentForge section of this site.",
      sources: ["AgentForge system map"],
    };
  }
  if (has("splitsage", "split sage")) {
    return {
      text: "SplitSage AI is Shivam's expense-intelligence product — its MVP is completed. It reads receipts with OCR and turns shared expenses into clear, settled splits. Stack: Next.js, Express, PostgreSQL, Prisma, OCR, Groq. Its full case study is being documented for the Projects section.",
      sources: ["AgentForge system map"],
    };
  }
  if (has("nova")) {
    return {
      text: "NOVA Agent is the planner of the AgentForge ecosystem — an autonomous planning agent, currently in the planning stage. Intended stack: Python, LangGraph, CrewAI.",
      sources: ["AgentForge system map"],
    };
  }
  if (has("astra") && has("project", "what is", "explain", "built", "voice")) {
    const v = bySlug("astra");
    if (v) return projectAnswer(v);
  }
  if (has("data4viz", "hackathon", "won", "win", "achievement", "award")) {
    const ach = achievements.map((a) => `${a.title}: ${a.detail}`).join("\n");
    return {
      text: ach
        ? `Yes — Shivam's verified achievements on this site:\n${ach}`
        : "Data4Viz — an AI-powered automated EDA tool built with Team Alpha — won 1st place at the Modern College of Engineering hackathon.",
      sources: ["Achievements"],
    };
  }
  if (has("contact", "email", "reach", "hire", "get in touch")) {
    return {
      text: `You can reach ${p.name} at ${p.email}, on GitHub (${p.github}) or LinkedIn (${p.linkedin}) — or use the contact form on this site and he'll reply personally. ${p.availability}.`,
      sources: ["Profile", "Contact page"],
    };
  }
  if (has("resume", "cv")) {
    return {
      text: "Shivam's PDF resume isn't uploaded here yet — the Resume page shows the current summary, and you can request the PDF through the contact form.",
      sources: ["Resume page"],
    };
  }
  if (has("skill", "technolog", "stack", "tools", "fastapi", "pgvector", "postgres", "language")) {
    const groups = skillGroups.map((g) => `${g.name}: ${g.skills.join(", ")}`).join("\n");
    return {
      text: `Shivam's published stack, by group:\n${groups}\n\nHis document-intelligence work (VERITAS) runs on FastAPI + PostgreSQL with pgvector for semantic search over MiniLM embeddings.`,
      sources: ["Stack Explorer"],
    };
  }
  if (has("education", "study", "studying", "college", "university", "mca", "bca", "cgpa", "degree")) {
    const edu = education.map((e) => `${e.title} — ${e.org}${e.location ? `, ${e.location}` : ""} (${e.period}) · ${e.badge}`).join("\n");
    return { text: edu || p.intro, sources: ["Education"] };
  }
  if (has("intern", "experience", "rubixe", "work history", "job")) {
    const exp = experience.map((e) => `${e.title} — ${e.org} (${e.period}). ${e.detail}`).join("\n");
    return {
      text: exp || "Shivam completed a 6-month Data Science internship at Rubixe AI Solutions and is a Certified Data Scientist.",
      sources: ["Experience"],
    };
  }
  if (has("project")) {
    const list = projects.map((x) => `• ${x.title} — ${x.tagline} (${x.status.replace("-", " ")})`).join("\n");
    return { text: `Projects published on this site:\n${list}\n\nAsk me about any one of them by name.`, sources: ["Projects"] };
  }
  if (has("open to work", "available", "looking for", "opportunit")) {
    return { text: `${p.availability}. Shivam is based in ${p.location} and is building toward: ${p.careerDirections.join(" · ")}.`, sources: ["Profile"] };
  }
  if (has("where", "location", "based")) {
    return { text: `${p.name} is based in ${p.location}. ${p.availability}.`, sources: ["Profile"] };
  }
  if (has("who is", "about shivam", "tell me about", "introduce", "hello", "hi")) {
    return { text: `${p.name} — ${p.role}. ${p.intro}`, sources: ["Profile"] };
  }
  return null;
}

export default function AstraOrb() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "astra",
      text: `Hi, I'm ASTRA — Shivam's portfolio assistant. Ask me about his projects, skills, education, experience or achievements. I only answer from what's published here.`,
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("astra:open", onOpen);
    return () => window.removeEventListener("astra:open", onOpen);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    const local = localAstraAnswer(q);
    setMessages((m) => [
      ...m,
      local
        ? { role: "astra", text: local.text, sources: [...local.sources, "answered on-device"] }
        : {
            role: "astra",
            text: "I only answer from what's published on this portfolio — ask me about Shivam's projects, skills, education, experience or achievements, and I'll answer from the site itself.",
          },
    ]);
  };

  return (
    <>
      {open && (
        <div
          className="panel-in fixed inset-x-3 z-[60] flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[380px]"
          style={{ bottom: "calc(6.5rem + env(safe-area-inset-bottom, 0px))", borderColor: "var(--border)", background: "var(--surface)" }}
          role="dialog"
          aria-label="Chat with ASTRA, the portfolio assistant"
        >
          <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold" style={{ background: "var(--accent)", color: "#04101a" }}>
              A
              <span className="anim-blink absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">ASTRA</p>
              <p className="truncate text-xs" style={{ color: "var(--muted)" }}>
                Portfolio assistant · answers only from published content
              </p>
            </div>
            <button
              type="button"
              aria-label="Reset conversation"
              className="rounded-lg px-2 py-1 text-xs"
              style={{ color: "var(--muted)" }}
              onClick={() =>
                setMessages([
                  { role: "astra", text: "Conversation reset. Ask me anything about Shivam's work, skills, education or projects." },
                ])
              }
            >
              Reset
            </button>
            <button
              type="button"
              aria-label="Close ASTRA chat"
              className="rounded-lg px-2 py-1 text-lg leading-none"
              style={{ color: "var(--muted)" }}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className="max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm"
                  style={
                    m.role === "user"
                      ? { background: "var(--accent)", color: "#04101a", borderBottomRightRadius: 4 }
                      : { background: "var(--surface2)", color: "var(--text)", borderBottomLeftRadius: 4 }
                  }
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.sources && m.sources.length > 0 && (
                    <p className="mt-1.5 text-[11px]" style={{ color: "var(--muted)" }}>
                      Source: {m.sources.join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="rounded-full border px-3 py-1.5 text-xs"
                    style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                    onClick={() => send(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="flex gap-2 border-t p-3"
            style={{ borderColor: "var(--border)" }}
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              aria-label="Ask ASTRA a question about Shivam"
              className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none"
              style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
              placeholder="Ask about projects, skills, education…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-40"
              style={{ background: "var(--accent)", color: "#04101a" }}
            >
              Ask
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-label={open ? "Close ASTRA assistant" : "Open ASTRA, the portfolio AI assistant — ask about Shivam"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="anim-orb group fixed right-4 z-[60] flex items-center gap-2 rounded-full py-2 pl-2 pr-4 text-sm font-bold shadow-2xl sm:right-5"
        style={{ bottom: "calc(1.1rem + env(safe-area-inset-bottom, 0px))", background: "var(--accent)", color: "#04101a" }}
      >
        <span aria-hidden="true" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black/15 text-lg">
          {open ? "×" : "A"}
          {!open && <span className="anim-blink absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2" />}
        </span>
        <span className="text-left leading-tight">
          {open ? "Close" : "Ask ASTRA"}
          {!open && <span className="block text-[10px] font-medium opacity-75">AI assistant · online</span>}
        </span>
      </button>
    </>
  );
}
