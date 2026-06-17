import { useState } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";
import { generateRiskAnalysis } from "@/services/api";

export function RiskAnalysisSection() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await generateRiskAnalysis();
      setReport(String(res.risks ?? res.analysis ?? JSON.stringify(res, null, 2)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to analyze risks");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Risk analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Identify key risks, red flags, and areas needing deeper review.
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
          Analyze risks
        </button>
      </header>

      <div className="rounded-xl border border-border bg-card p-6 min-h-[200px]">
        {!report && !loading && !error && (
          <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground py-12">
            <ShieldAlert className="h-8 w-8 mb-2 opacity-60" />
            No analysis yet. Click “Analyze risks” to generate a report.
          </div>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Analyzing risks…
          </div>
        )}
        {error && <div className="text-sm text-destructive">{error}</div>}
        {report && (
          <article className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
            {report}
          </article>
        )}
      </div>
    </div>
  );
}
