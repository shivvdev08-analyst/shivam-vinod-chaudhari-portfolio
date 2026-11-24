import type { Metadata } from "next";
import "./globals.css";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ScrollProgress from "@/components/ScrollProgress";
import { profile, seo } from "@/data/portfolio";

export const metadata: Metadata = {
  title: seo.siteTitle,
  description: seo.description,
  keywords: seo.keywords,
  openGraph: { title: seo.siteTitle, description: seo.description, type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="aurora">
      <body>
        <ScrollProgress />
        <header className="sticky top-0 z-50 border-b" style={{ background: "color-mix(in srgb, var(--bg) 88%, transparent)", borderColor: "var(--border)", backdropFilter: "blur(8px)" }}>
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <a href="/" className="font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
              SVC<span style={{ color: "var(--accent)" }}> · </span>{profile.name}
            </a>
            <nav className="flex flex-wrap gap-4 text-sm" aria-label="Main">
              <a href="/#projects">Projects</a>
              <a href="/#about">About</a>
              <a href="/#skills">Skills</a>
              <a href="/#memories">Memories</a>
              <a href="/#lab">AI Lab</a>
              <a href="/#contact">Contact</a>
            </nav>
            <ThemeSwitcher />
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t px-4 py-8" style={{ borderColor: "var(--border)" }}>
          <div className="mx-auto max-w-6xl text-sm" style={{ color: "var(--muted)" }}>
            <p>© {new Date().getFullYear()} {profile.name} — {profile.tagline}</p>
            <p className="mt-2">
              <a href="/privacy">Privacy Policy</a>
              {" · "}
              <a href="/resume">Resume</a>
              {" · "}
              <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
              {" · "}
              <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            </p>
            <p className="mt-2">
              Owner Admin, the contact inbox, analytics and the full ASTRA assistant live in the Muse-hosted
              portfolio — this Vercel export is the public site only. See README.md in this repo.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
