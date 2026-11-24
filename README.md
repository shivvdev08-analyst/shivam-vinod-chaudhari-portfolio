# Shivam Vinod Chaudhari — Portfolio

Personal portfolio website for **Shivam Vinod Chaudhari — Aspiring AI Engineer & Full-Stack Developer**.
Tagline: *Turning intelligence into innovation.*

Live source: this repo. Deployed on Vercel from `main`.

## What this is

A faithful Next.js (App Router, React, TypeScript, Tailwind CSS) export of the
Muse-hosted portfolio **v8 “Neural Spectrum”** — same sections, same verified
content, same four themes. No design or content changes were made for the export.
This update brings the v8 reachability fixes to the public site: the Neural
Command Centre auto-cycles Perceive → Reason → Act → Evaluate with a live stats
board and Try-the-system buttons, the AgentForge map nodes are clickable with
detail panels, and the hero has an Ask ASTRA button and a Neural Command Centre
jump link.

- **Themes:** Aurora (teal / violet / emerald, default), Verdant, Solar Forge, Ultraviolet — switchable from the header, choice remembered in the browser.
- **Hero:** live neural-network canvas behind the hero, spectrum ring around Shivam's real photo (`public/photo.jpg`).
- **Neural Command Centre:** Perceive / VERITAS → Reason / NOVA → Act / ASTRA → Evaluate / SafeGen. Auto-cycles through the four stages until the visitor picks one, with a stats board counted from this site's own content (systems, in development, technologies, memories) and Try-the-system buttons for SafeGen, AgentForge and ASTRA.
- **Stack Explorer, Spotlight project cards** with Simple + Deep Technical case-study pages (`/projects/[slug]`).
- **Memories:** only the verified memory is seeded — Data4Viz, First Position at a Modern College of Engineering hackathon, with Team Alpha. No dates or details are invented for other visits.
- **AgentForge System Map:** SafeGen, ASTRA, NOVA, SplitSage — clickable nodes with detail panels (role, connections, stack, case-study links) and a planned outer ring. VERITAS is deliberately excluded — it is a separate MCA capstone.
- **Live AI Lab:** interactive SafeGen Generate → Judge → Repair demo, clearly labelled a demo. It publishes no experimental metrics.
- **Ask ASTRA:** static grounded FAQ on this export. The full server assistant lives in the Muse artifact (below).

## Content — verified only

- MCA (2025–2027), Dr. D. Y. Patil Dnyan Prasad Global University, Tathawade, Pune — CGPA 9.09 (two-semester)
- BCA, Moolji Jetha Autonomous College, Jalgaon — CGPA 8.33
- Data Science Intern, Rubixe AI Solutions — 6 months. Certified Data Scientist; internship completion certificate. No responsibilities are invented — details are given only as verified.
- Projects: ASTRA (in development, voice-first, Ollama), VERITAS (MCA capstone with Divya Padukone — Python, FastAPI, PostgreSQL/pgvector, EasyOCR, MiniLM 384-dim), SafeGen AI (Generate → Judge → Repair, in progress, no benchmark results published), Data4Viz (1st place, Team Alpha), Sentiment Impact on Stock Market (FinBERT + XGBoost + yfinance, Streamlit), AlertX (being documented — repo has no README, so no claims are made about it).
- Honest positioning as an emerging AI engineer. Feature states are labelled Implemented / In development / Planned.

## Photo

Shivam's real headshot lives at `public/photo.jpg` in the local export.
**It is not in this GitHub repo (verified 2026-11-25: `public/photo.jpg` is not
in the repo and returns 404 on the Vercel site):** the GitHub connector used for
this upload can only push UTF-8 text files, not binary images. To finish it, upload
`public/photo.jpg` (400×400 JPEG, from the local export) via GitHub web:
repo → **Add file → Upload files** → drop `photo.jpg` into `public/` → Commit.
Until then the hero shows an “SVC” monogram fallback instead of a broken image.
No stock face is ever used.

```bash
npm install
npm run dev    # http://localhost:3000
npm run build
npm start
```

No secrets are required. See `.env.example`.

## Deploy on Vercel

1. In Vercel, **Add New → Project → Import** this repo (`shivvdev08-analyst/shivam-vinod-chaudhari-portfolio`).
2. Framework preset: **Next.js**. No environment variables are needed.
3. Deploy. Vercel builds with `npm run build`.

## What is included vs what stays in the Muse artifact

**Included in this export:** all public pages, themes, project case studies, memories, AgentForge map, SafeGen demo, grounded ASTRA FAQ, privacy and resume pages.

**NOT in this export (they need the Muse-hosted fullstack artifact, slug `shivam-vinod-chaudhari-portfolio`):**
- Owner Admin panel (PIN-gated CMS, project/blog/memory management, resume uploads)
- Contact inbox (server-stored inquiries, spam filtering, CSV export) — here the contact link opens a mailto instead
- Real analytics (page/project views, GitHub/demo clicks)
- The full ASTRA assistant (server-grounded answers) and Muse Admin Copilot
- AI provider configuration

No PINs, admin credentials, API keys or secrets are in this repo.

## Links

- GitHub: https://github.com/shivvdev08-analyst
- LinkedIn: https://www.linkedin.com/in/shivam-chaudhari-30a5ba3a8/
- Email: shivv.dev08@gmail.com
