import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileCheck2, Loader2 } from "lucide-react";
import { uploadPdf } from "@/services/api";
import { cn } from "@/lib/utils";

export function UploadSection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    setUploading(true);
    try {
      await uploadPdf(file);
      setUploadedName(file.name);
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight">Upload document</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drag and drop a PDF, or click to browse. The file is sent to your FastAPI backend.
        </p>
      </header>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
        </div>
        <div className="text-sm font-medium">
          {uploading ? "Uploading…" : "Drop your PDF here or click to browse"}
        </div>
        <div className="text-xs text-muted-foreground">PDF only · Max ~25MB</div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {uploadedName && !error && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm">
          <FileCheck2 className="h-5 w-5 text-primary" />
          <div>
            <div className="font-medium">Upload successful</div>
            <div className="text-muted-foreground">{uploadedName}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
