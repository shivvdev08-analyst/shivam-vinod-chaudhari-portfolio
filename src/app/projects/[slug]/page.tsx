import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/data/portfolio";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const p = projects.find((x) => x.slug === params.slug);
  if (!p) notFound();
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p><Link href="/#projects">← All projects</Link></p>
      <p className="eyebrow mt-6">{p.category} · {p.status}</p>
      <h1 className="mt-2 text-4xl font-extrabold">{p.title}</h1>
      <p className="mt-2 text-lg" style={{ color: "var(--accent)" }}>{p.tagline}</p>
      <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{p.team}</p>
      <div className="mt-4 flex flex-wrap gap-2">{p.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
      {p.githubUrl && <p className="mt-4"><a className="btn-ghost" href={p.githubUrl} target="_blank" rel="noreferrer">View on GitHub</a></p>}

      <h2 className="section-title mt-10">Simple view</h2>
      <p className="mt-3 leading-relaxed" style={{ color: "var(--muted)" }}>{p.simpleSummary}</p>

      <h2 className="section-title mt-10">Deep technical view</h2>
      <div className="mt-4 space-y-6 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        <section><h3 className="font-bold" style={{ color: "var(--text)" }}>Problem</h3><p className="mt-1">{p.problem}</p></section>
        <section><h3 className="font-bold" style={{ color: "var(--text)" }}>Objectives</h3><ul className="mt-1 list-disc pl-5">{p.objectives.map((o) => <li key={o}>{o}</li>)}</ul></section>
        <section><h3 className="font-bold" style={{ color: "var(--text)" }}>Implementation</h3><p className="mt-1">{p.implementation}</p></section>
        <section><h3 className="font-bold" style={{ color: "var(--text)" }}>Architecture & workflow</h3><p className="mt-1">{p.architecture}</p></section>
        {p.challenges && <section><h3 className="font-bold" style={{ color: "var(--text)" }}>Challenges</h3><p className="mt-1">{p.challenges}</p></section>}
        {p.results && <section><h3 className="font-bold" style={{ color: "var(--text)" }}>Results</h3><p className="mt-1">{p.results}</p></section>}
        {p.limitations && <section><h3 className="font-bold" style={{ color: "var(--text)" }}>Limitations</h3><p className="mt-1">{p.limitations}</p></section>}
        <section><h3 className="font-bold" style={{ color: "var(--text)" }}>What&apos;s next</h3><p className="mt-1">{p.future}</p></section>
        <section><h3 className="font-bold" style={{ color: "var(--text)" }}>Contribution</h3><p className="mt-1">{p.contribution}</p></section>
        <section>
          <h3 className="font-bold" style={{ color: "var(--text)" }}>Features — labelled honestly</h3>
          <ul className="mt-2 space-y-1">{p.featureStatus.map((f) => <li key={f.feature}>{f.feature} — <strong>{f.state}</strong></li>)}</ul>
        </section>
      </div>
    </div>
  );
}
