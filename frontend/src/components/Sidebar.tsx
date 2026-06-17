import { Upload, MessageSquare, FileText, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionKey = "upload" | "chat" | "summary" | "risk";

const items: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "upload", label: "Upload", icon: Upload },
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "summary", label: "Summary", icon: FileText },
  { key: "risk", label: "Risk Analysis", icon: ShieldAlert },
];

export function Sidebar({
  active,
  onSelect,
}: {
  active: SectionKey;
  onSelect: (k: SectionKey) => void;
}) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">DD Copilot</div>
          <div className="text-xs text-muted-foreground">AI Due Diligence</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active === key
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-6 py-4 text-xs text-muted-foreground border-t border-sidebar-border">
        v1.0 · Local FastAPI
      </div>
    </aside>
  );
}
