"use client";
import { useState } from "react";
import Link from "next/link";
import { profile, skillGroups } from "@/data/portfolio";

/**
 * The Origin paths: Shivam's four real career directions as working
 * selectors. Tapping any path swaps the story panel below — what that
 * direction means for him, the verified evidence behind it, and the skills
 * it draws on. Pure client state, so it behaves identically in the Muse
 * app and in this static export.
 */
type OriginPath = {
  match: string;
  headline: string;
  body: string;
  evidence: Array<{ label: string; href: string }>;
  skills: string[];
};

const ORIGIN_PATHS: OriginPath[] = [
  {
    match: "AI Engineer",
    headline: "The primary path — building intelligent systems end to end.",
    body: "This is the role the whole portfolio is aimed at, and the target is a first AI Engineer job by graduation in 2027. The evidence is the work itself: ASTRA, a voice-first personal AI companion running on local models; SafeGen AI, a self-reflective evaluation loop that judges and repairs LLM output; and VERITAS, document intelligence built with Divya Padukone as the MCA capstone.",
    evidence: [
      { label: "ASTRA case study", href: "/projects/astra" },
      { label: "SafeGen AI case study", href: "/projects/safegen-ai" },
      { label: "Run SafeGen in the AI Lab", href: "/#lab" },
    ],
    skills: ["LLM Evaluation", "Semantic Search & Embeddings", "Ollama (Local LLMs)", "FastAPI", "Python"],
  },
  {
    match: "Machine Learning Engineer",
    headline: "The modelling path — data in, decisions out.",
    body: "The ML engineering thread runs through the Sentiment Impact project — FinBERT reads trader sentiment, XGBoost turns it into an UP/DOWN market call — through SafeGen's LLM-as-a-judge evaluation, and through VERITAS, where Sentence Transformers (MiniLM, 384-dim) embeddings make documents searchable by meaning, not keywords.",
    evidence: [
      { label: "Sentiment Impact case study", href: "/projects/sentiment-stock" },
      { label: "VERITAS case study", href: "/projects/veritas" },
      { label: "SafeGen AI case study", href: "/projects/safegen-ai" },
    ],
    skills: ["Machine Learning", "Deep Learning", "Sentiment Analysis (FinBERT)", "XGBoost", "Scikit-learn", "Sentence Transformers"],
  },
  {
    match: "Data Scientist",
    headline: "Where it started — six months of professional data science.",
    body: "Before the MCA, this path was already professional: six months as a Data Science Intern at Rubixe AI Solutions and a Certified Data Scientist credential. Its proof piece is Data4Viz — automated exploratory data analysis that took 1st place with Team Alpha at the Modern College of Engineering hackathon.",
    evidence: [
      { label: "Data4Viz case study", href: "/projects/data4viz" },
      { label: "Sentiment Impact case study", href: "/projects/sentiment-stock" },
    ],
    skills: ["Python", "SQL", "Machine Learning", "XGBoost", "Scikit-learn", "Streamlit"],
  },
  {
    match: "Full-Stack AI Product Engineer",
    headline: "The product path — AI that ships as finished software.",
    body: "This path is about owning the whole product, not just the model: SplitSage AI's MVP is complete end to end (Next.js, Express, PostgreSQL, Prisma, OCR, Groq), VERITAS pairs a FastAPI backend with PostgreSQL/pgvector storage, and this portfolio itself runs as a full platform — public site, owner admin, live AI Lab and assistant.",
    evidence: [
      { label: "VERITAS case study", href: "/projects/veritas" },
      { label: "SplitSage on the AgentForge map", href: "/#lab" },
      { label: "All projects", href: "/#projects" },
    ],
    skills: ["FastAPI", "PostgreSQL", "pgvector", "React", "Next.js", "TypeScript", "Node.js", "Express"],
  },
];

export default function OriginPaths() {
  const directions = profile.careerDirections;
  const [selected, setSelected] = useState<string>(directions[0] ?? "AI Engineer");
  const allSkills = skillGroups.flatMap((g) => g.skills);
  const path =
    ORIGIN_PATHS.find((o) => selected.toLowerCase().includes(o.match.toLowerCase())) ??
    ORIGIN_PATHS.find((o) => o.match === "AI Engineer")!;
  const chips = path.skills.filter((s) => allSkills.some((a) => a.toLowerCase() === s.toLowerCase()));
  const accents = ["var(--accent)", "var(--a2)", "var(--a3)", "#fbbf24"];
  const activeIdx = Math.max(0, directions.findIndex((d) => d === selected));
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a career path">
        {directions.map((d, i) => (
          <button
            key={d}
            type="button"
            onClick={() => setSelected(d)}
            aria-pressed={selected === d}
            className="rounded-full px-4 py-2 text-sm transition"
            style={
              selected === d
                ? { background: accents[i % accents.length], color: "#04101a", fontWeight: 600 }
                : { border: "1px solid var(--border)", color: "var(--muted)" }
            }
          >
            {i + 1}. {d}
          </button>
        ))}
      </div>
      <div
        key={selected}
        className="stage-in mt-5 rounded-3xl border p-6"
        style={{ borderColor: accents[activeIdx % accents.length], background: "var(--surface)" }}
        aria-live="polite"
      >
        <p className="text-[11px] uppercase tracking-[0.25em]" style={{ color: accents[activeIdx % accents.length] }}>
          Path {activeIdx + 1} of {directions.length} · {selected}
        </p>
        <h3 className="mt-2 text-xl font-bold leading-snug">{path.headline}</h3>
        <p className="mt-2 leading-7" style={{ color: "var(--muted)" }}>{path.body}</p>
        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {chips.map((sk) => (
              <span key={sk} className="rounded-lg border px-2.5 py-1 text-[11px]" style={{ borderColor: "var(--border)", background: "var(--surface2)" }}>
                {sk}
              </span>
            ))}
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {path.evidence.map((e) =>
            e.href.startsWith("/#") ? (
              <a key={e.href + e.label} href={e.href} className="rounded-xl border px-4 py-2.5 text-sm font-medium" style={{ borderColor: "var(--border)" }}>
                {e.label} →
              </a>
            ) : (
              <Link key={e.href + e.label} href={e.href} className="rounded-xl border px-4 py-2.5 text-sm font-medium" style={{ borderColor: "var(--border)" }}>
                {e.label} →
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
