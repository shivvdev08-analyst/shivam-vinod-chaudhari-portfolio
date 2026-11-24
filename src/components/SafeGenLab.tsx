"use client";
import { useState } from "react";

/**
 * Live AI Lab — interactive SafeGen Generate → Judge → Repair demo.
 * Clearly labelled a demo: a small client-side heuristic, not the production
 * SafeGen system, and it publishes no experimental metrics.
 */
export default function SafeGenLab() {
  const [input, setInput] = useState("The new model is 100% accurate and always safe to use in every situation.");
  const [result, setResult] = useState<null | { verdict: string; issues: string[]; repaired: string }>(null);
  const run = () => {
    const issues: string[] = [];
    if (/100%|always|never|guaranteed/i.test(input)) issues.push("Absolute claim — no evidence given.");
    if (/best|perfect|flawless/i.test(input)) issues.push("Superlative without a comparison or benchmark.");
    if (input.trim().length < 20) issues.push("Too short to judge reliably.");
    const repaired =
      issues.length === 0
        ? input
        : "This is a claim that needs evidence. " +
          "Say what was measured, on what data, and what the limits are — instead of an absolute statement.";
    setResult({
      verdict: issues.length === 0 ? "PASS — no issues flagged by this demo judge" : `FLAGGED — ${issues.length} issue(s) found by this demo judge`,
      issues,
      repaired,
    });
  };
  return (
    <div className="card p-5">
      <p className="eyebrow">Live AI Lab · SafeGen demo</p>
      <h3 className="section-title mt-1">Generate → Judge → Repair</h3>
      <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
        A demonstration of the workflow only — not the production SafeGen system, and it publishes no experimental metrics.
      </p>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3}
        className="mt-4 w-full rounded-lg border p-3 text-sm"
        style={{ background: "var(--bg2)", borderColor: "var(--border)", color: "var(--text)" }}
        aria-label="Text to evaluate" />
      <button onClick={run} className="btn mt-3">Run Generate → Judge → Repair</button>
      {result && (
        <div className="mt-4 space-y-3 text-sm">
          <p><strong>Generate:</strong> {input}</p>
          <p><strong>Judge:</strong> {result.verdict}</p>
          {result.issues.length > 0 && <ul className="list-disc pl-5">{result.issues.map((i) => <li key={i}>{i}</li>)}</ul>}
          <p><strong>Repair:</strong> {result.repaired}</p>
        </div>
      )}
    </div>
  );
}
