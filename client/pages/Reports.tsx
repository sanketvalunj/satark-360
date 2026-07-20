import { useState } from "react";
import { FileText, RefreshCw } from "lucide-react";
import { SatarkLayout } from "@/components/SatarkLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { AIPipelinePanel } from "@/components/AIPipelinePanel";

export default function Reports() {
  const { investigations, reports, generateReport, analysisSessions, getAnalysisSession } = useApp();
  const [busyId, setBusyId] = useState<string | null>(null);
  const activeSession = analysisSessions.find((session) => session.status !== "completed");

  const generate = async (id: string) => {
    setBusyId(id);
    try {
      await generateReport(id);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SatarkLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-2">
            Generate investigation summaries from the live case store.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIPipelinePanel session={activeSession} title="Report Orchestrator" />

          <Card className="p-6 card-hover">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Progressive Report Sections
            </h3>
            {activeSession ? (
              <div className="space-y-3">
                {activeSession.reportSections.map((section) => (
                  <div key={section.title} className="p-3 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="text-sm font-medium text-foreground">{section.title}</p>
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {section.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{section.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 rounded-lg border border-dashed border-border bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
                Open a case to begin progressive report assembly.
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {investigations.map((investigation) => {
            const report = reports.find((item) => item.investigationId === investigation.id);
            return (
              <Card key={investigation.id} className="p-6 card-hover">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{investigation.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{investigation.id}</p>
                  </div>
                  <FileText className="w-5 h-5 text-primary" />
                </div>

                <p className="text-sm text-foreground mt-4 leading-relaxed">{report?.content ?? investigation.summary}</p>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">
                    {report ? `Generated ${report.generatedAt.toLocaleString()}` : "No report generated yet"}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generate(investigation.id)}
                    disabled={busyId === investigation.id}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {busyId === investigation.id ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </SatarkLayout>
  );
}
