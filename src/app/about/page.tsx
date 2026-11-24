import OriginPaths from "@/components/OriginPaths";
import Reveal from "@/components/Reveal";
import { profile, education, experience } from "@/data/portfolio";

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <p className="eyebrow">About</p>
      <h1 className="mt-1 text-4xl font-extrabold">{profile.name}</h1>
      <p className="mt-3 text-xl font-semibold" style={{ color: "var(--accent)" }}>{profile.role}</p>
      <p className="mt-5 text-lg leading-8" style={{ color: "var(--muted)" }}>{profile.intro}</p>
      <div className="mt-8 space-y-4 text-[17px] leading-8" style={{ color: "var(--muted)" }}>
        <p>{profile.origin}</p>
      </div>
      <Reveal>
        <div className="mt-10">
          <h2 className="text-2xl font-bold">Career direction</h2>
          <p className="mt-2" style={{ color: "var(--muted)" }}>Four paths, in order — tap any one to see what it means and the work behind it.</p>
          <div className="mt-4">
            <OriginPaths />
          </div>
        </div>
      </Reveal>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold">Education</h3>
          <ul className="mt-4 space-y-4">
            {education.map((t) => (
              <li key={t.title} className="border-l-2 pl-5" style={{ borderColor: "var(--border)" }}>
                <p className="font-semibold">{t.title}</p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{t.org}{t.location ? ` · ${t.location}` : ""} · {t.period}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{t.detail}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Experience</h3>
          <ul className="mt-4 space-y-4">
            {experience.map((t) => (
              <li key={t.title} className="border-l-2 pl-5" style={{ borderColor: "var(--border)" }}>
                <p className="font-semibold">{t.title}</p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{t.org} · {t.period}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{t.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="card mt-10 px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>
        Honest positioning: I am an emerging AI engineer. Everything on this site is labelled as it
        is — completed, in development, research, or planned.
      </p>
    </div>
  );
}
