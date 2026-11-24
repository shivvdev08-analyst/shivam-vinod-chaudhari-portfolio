import Link from "next/link";
import Photo from "@/components/Photo";
import NeuralCanvas from "@/components/NeuralCanvas";
import CommandCentre from "@/components/CommandCentre";
import SafeGenLab from "@/components/SafeGenLab";
import AgentForgeMap from "@/components/AgentForgeMap";
import {
  profile, education, experience, certifications, achievements,
  skillGroups, projects, memories,
} from "@/data/portfolio";

const faqs = [
  { q: "Has he won any hackathons?", a: "Yes — First Position at a Modern College of Engineering hackathon with Team Alpha, for Data4Viz, an AI-powered EDA automation app." },
  { q: "What is he studying?", a: "MCA (2025–2027) at Dr. D. Y. Patil Dnyan Prasad Global University, Tathawade, Pune — two-semester CGPA 9.09. BCA from Moolji Jetha Autonomous College, Jalgaon — CGPA 8.33." },
  { q: "What is VERITAS?", a: "His MCA capstone with Divya Padukone — a multimodal document intelligence platform: EasyOCR, MiniLM 384-dim embeddings, PostgreSQL/pgvector semantic search, FastAPI." },
  { q: "What is ASTRA?", a: "His personal AI companion, in development — voice-first, local AI via Ollama, application launching and long-term memory." },
  { q: "Is he open to work?", a: "Open to AI engineering internships and entry-level roles." },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-24">
        <NeuralCanvas />
        <div className="relative mx-auto grid max-w-6xl gap-10 sm:grid-cols-[1.4fr_1fr] sm:items-center">
          <div>
            <p className="eyebrow">Aspiring AI Engineer · Pune, India</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              {profile.name}
            </h1>
            <p className="mt-3 text-xl font-semibold" style={{ color: "var(--accent)" }}>{profile.role}</p>
            <p className="mt-2 text-lg" style={{ color: "var(--muted)" }}>{profile.tagline}</p>
            <p className="mt-5 max-w-xl" style={{ color: "var(--muted)" }}>{profile.intro}</p>
            <p className="mt-3"><span className="chip">{profile.availability}</span></p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a className="btn" href="#projects">View Projects</a>
              <a className="btn-ghost" href="#contact">Contact</a>
              <a className="btn-ghost" href="/resume">Resume — available on request</a>
            </div>
            <p className="mt-5 text-sm" style={{ color: "var(--muted)" }}>
              <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
              {" · "}
              <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              {" · "}
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </p>
          </div>
          <div className="flex justify-center">
            <div className="spectrum-ring">
              <Photo />
            </div>
          </div>
        </div>
      </section>

      {/* Command Centre */}
      <section className="mx-auto max-w-6xl px-4 pb-10"><CommandCentre /></section>

      {/* Origin */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-10">
        <p className="eyebrow">The Origin</p>
        <h2 className="section-title mt-1">How I got here</h2>
        <p className="mt-4 max-w-3xl leading-relaxed" style={{ color: "var(--muted)" }}>{profile.origin}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {profile.careerDirections.map((d) => <span key={d} className="chip">{d}</span>)}
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="mx-auto max-w-6xl px-4 py-10">
        <p className="eyebrow">Project Lab · Spotlight</p>
        <h2 className="section-title mt-1">What I have actually built</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          Feature states are labelled honestly — Implemented, In development, Planned, or Built at hackathon.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {projects.map((p) => (
            <article key={p.slug} className="card p-5">
              <p className="eyebrow">{p.category} · {p.status}</p>
              <h3 className="mt-2 text-2xl font-bold">{p.title}</h3>
              <p className="mt-1 font-medium" style={{ color: "var(--accent)" }}>{p.tagline}</p>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{p.simpleSummary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.stack.map((s) => <span key={s} className="chip">{s}</span>)}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link className="btn" href={`/projects/${p.slug}`}>Case study</Link>
                {p.githubUrl && <a className="btn-ghost" href={p.githubUrl} target="_blank" rel="noreferrer">GitHub</a>}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Stack Explorer */}
      <section id="skills" className="mx-auto max-w-6xl px-4 py-10">
        <p className="eyebrow">Stack Explorer</p>
        <h2 className="section-title mt-1">Tools I work with</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((g) => (
            <div key={g.name} className="card p-5">
              <h3 className="font-bold">{g.name}</h3>
              <div className="mt-3 flex flex-wrap gap-2">{g.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <p className="eyebrow">Education & Experience</p>
        <h2 className="section-title mt-1">Timeline</h2>
        <div className="mt-6 space-y-4">
          {[...education, ...experience].map((t) => (
            <div key={t.title} className="card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-bold">{t.title}</h3>
                <span className="chip">{t.period} · {t.badge}</span>
              </div>
              <p className="mt-1" style={{ color: "var(--muted)" }}>{t.org}{t.location ? ` — ${t.location}` : ""}</p>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{t.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="card p-5">
            <h3 className="font-bold">Certifications</h3>
            <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--muted)" }}>
              {certifications.map((c) => <li key={c.title}><strong style={{ color: "var(--text)" }}>{c.title}</strong> — {c.issuer}</li>)}
            </ul>
          </div>
          <div className="card p-5">
            <h3 className="font-bold">Achievements</h3>
            <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--muted)" }}>
              {achievements.map((a) => <li key={a.title}><strong style={{ color: "var(--text)" }}>{a.title}</strong> ({a.context}) — {a.detail}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* Memories */}
      <section id="memories" className="mx-auto max-w-6xl px-4 py-10">
        <p className="eyebrow">Memories</p>
        <h2 className="section-title mt-1">Academic & personal moments</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          Only verified memories are shown here. No dates or details are invented for visits or events not yet documented.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {memories.map((m) => (
            <article key={m.title} className="card p-5">
              <p className="chip inline-block">{m.category} · Featured</p>
              <h3 className="mt-3 text-lg font-bold">{m.title}</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{m.caption}</p>
              <div className="mt-3 flex flex-wrap gap-2">{m.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            </article>
          ))}
        </div>
      </section>

      {/* AgentForge + AI Lab */}
      <section id="lab" className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <AgentForgeMap />
        <SafeGenLab />
      </section>

      {/* ASTRA — static grounded FAQ (the full server assistant lives in the Muse artifact) */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <p className="eyebrow">Ask ASTRA</p>
        <h2 className="section-title mt-1">Answers, grounded only in this portfolio</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          The full ASTRA assistant lives in the Muse-hosted portfolio. These are the verified answers it gives most often.
        </p>
        <div className="mt-6 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="card p-4">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-6xl px-4 py-10">
        <p className="eyebrow">Contact</p>
        <h2 className="section-title mt-1">Let&apos;s talk</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          This export has no server inbox — your message opens your mail app addressed to Shivam.
          The contact inbox with spam filtering lives in the Muse-hosted portfolio.
        </p>
        <div className="card mt-6 p-5">
          <p><strong>Email:</strong> <a href={`mailto:${profile.email}`}>{profile.email}</a></p>
          <p className="mt-2"><strong>Location:</strong> {profile.location}</p>
          <p className="mt-4"><a className="btn" href={`mailto:${profile.email}?subject=Hello%20Shivam%20—%20from%20your%20portfolio`}>Email Shivam</a></p>
        </div>
      </section>
    </div>
  );
}
