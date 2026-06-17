import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar, type SectionKey } from "@/components/Sidebar";
import { UploadSection } from "@/components/UploadSection";
import { ChatSection } from "@/components/ChatSection";
import { SummarySection } from "@/components/SummarySection";
import { RiskAnalysisSection } from "@/components/RiskAnalysisSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Due Diligence Copilot" },
      {
        name: "description",
        content:
          "Upload PDFs, chat with documents, and generate executive summaries and risk analyses with AI.",
      },
      { property: "og:title", content: "AI Due Diligence Copilot" },
      {
        property: "og:description",
        content:
          "Upload PDFs, chat with documents, and generate executive summaries and risk analyses with AI.",
      },
    ],
  }),
  component: Dashboard,
});

const TITLES: Record<SectionKey, string> = {
  upload: "Upload",
  chat: "Chat",
  summary: "Summary",
  risk: "Risk Analysis",
};

function Dashboard() {
  const [section, setSection] = useState<SectionKey>("upload");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Sidebar active={section} onSelect={setSection} />

      {/* Mobile sidebar drawer */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileNavOpen(false)}>
          <div className="absolute inset-y-0 left-0" onClick={(e) => e.stopPropagation()}>
            <Sidebar
              active={section}
              onSelect={(k) => {
                setSection(k);
                setMobileNavOpen(false);
              }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-lg font-semibold">{TITLES[section]}</h1>
          </div>
          <div className="text-xs text-muted-foreground">AI Due Diligence Copilot</div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
          {section === "upload" && <UploadSection />}
          {section === "chat" && <ChatSection />}
          {section === "summary" && <SummarySection />}
          {section === "risk" && <RiskAnalysisSection />}
        </main>
      </div>
    </div>
  );
}
