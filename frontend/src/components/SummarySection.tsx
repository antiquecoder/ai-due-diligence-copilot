import { useState } from "react";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { generateSummary } from "@/services/api";

export function SummarySection() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await generateSummary();
      setSummary(String(res.summary ?? JSON.stringify(res, null, 2)));
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Executive summary</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate a concise overview of the uploaded document.
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate summary
        </button>
      </header>

      <div className="rounded-xl border border-border bg-card p-6 min-h-[200px]">
        {!summary && !loading && !error && (
          <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground py-12">
            <FileText className="h-8 w-8 mb-2 opacity-60" />
            No summary yet. Click “Generate summary” to create one.
          </div>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Generating summary…
          </div>
        )}
        {error && <div className="text-sm text-destructive">{error}</div>}
        {summary && (
          <article className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
            {summary}
          </article>
        )}
      </div>
    </div>
  );
}
