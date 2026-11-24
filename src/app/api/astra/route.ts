import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { profile, projects, skillGroups, education, experience, achievements } from "@/data/portfolio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Server-grounded ASTRA: keyword retrieval over published portfolio content
// plus owner knowledge entries from Neon. No external LLM call, no invented
// answers. Out-of-scope questions are refused, never answered generally.
type Passage = { title: string; text: string };

function corpus(): Passage[] {
  const list: Passage[] = [
    { title: "Profile", text: `${profile.name} — ${profile.role}. ${profile.tagline}. ${profile.intro} Based in ${profile.location}. ${profile.availability}. Email ${profile.email}.` },
    { title: "Education", text: education.map((e) => `${e.title} at ${e.org}, ${e.location}, ${e.period}, ${e.badge}. ${e.detail}`).join(" ") },
    { title: "Experience", text: experience.map((e) => `${e.title} at ${e.org}, ${e.period}. ${e.detail}`).join(" ") },
    { title: "Achievements", text: achievements.map((a) => `${a.title} (${a.context}): ${a.detail}`).join(" ") },
    { title: "Skills", text: skillGroups.map((g) => `${g.name}: ${g.skills.join(", ")}`).join(". ") },
  ];
  for (const p of projects) {
    list.push({ title: p.title, text: `${p.title} — ${p.tagline} ${p.simpleSummary} Stack: ${p.stack.join(", ")}. Status: ${p.status}. Team: ${p.team}. ${p.implementation}` });
  }
  return list;
}

function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3);
}

export async function POST(req: Request) {
  let question = "";
  try { question = String((await req.json())?.question || "").trim(); } catch { /* ignore */ }
  if (question.length < 3) return NextResponse.json({ error: "QUESTION_REQUIRED" }, { status: 400 });
  const passages = corpus();
  const sql = getSql();
  if (sql) {
    try {
      const rows = await sql`SELECT question, answer, source FROM knowledge_entries`;
      for (const r of rows) passages.push({ title: String(r.source || "Knowledge base"), text: `${r.question} — ${r.answer}` });
    } catch { /* knowledge is optional */ }
  }
  const qTokens = new Set(tokens(question));
  const scored = passages
    .map((p) => ({ p, score: tokens(p.text).filter((t) => qTokens.has(t)).length }))
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best || best.score < 2) {
    return NextResponse.json({
      grounded: true,
      answer: "I only answer questions about Shivam Vinod Chaudhari and the work published on this portfolio — his projects, education, experience and skills. Could you ask about one of those?",
      sources: [],
      refused: true,
    });
  }
  const top = scored.filter((s) => s.score > 0).slice(0, 2);
  return NextResponse.json({
    grounded: true,
    answer: top.map((s) => s.p.text).join(" "),
    sources: [...new Set(top.map((s) => s.p.title))],
    refused: false,
  });
}
