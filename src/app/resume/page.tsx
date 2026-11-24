import { profile } from "@/data/portfolio";

export default function Resume() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">Resume</h1>
      <p className="mt-4" style={{ color: "var(--muted)" }}>
        Shivam&apos;s resume is a free PDF download — no sign-up, no permission
        needed. It is generated from the same published portfolio content shown
        across this site.
      </p>
      <p className="mt-6">
        <a className="btn" href="/Shivam-Vinod-Chaudhari-Resume.pdf" download>
          ⬇ Download Resume (PDF)
        </a>
      </p>
      <div className="card mt-8 p-5 text-sm" style={{ color: "var(--muted)" }}>
        <p><strong style={{ color: "var(--text)" }}>{profile.name}</strong> — {profile.role}</p>
        <p className="mt-2">MCA (2025–2027), Dr. D. Y. Patil Dnyan Prasad Global University, Pune — CGPA 9.09 · BCA, Moolji Jetha Autonomous College, Jalgaon — CGPA 8.33</p>
        <p className="mt-2">Data Science Intern, Rubixe AI Solutions — 6 months · Certified Data Scientist</p>
        <p className="mt-2">Projects: ASTRA · VERITAS (with Divya Padukone) · SafeGen AI · Data4Viz (1st place, Team Alpha) · Sentiment Impact on Stock Market · AlertX (being documented)</p>
      </div>
    </div>
  );
}
