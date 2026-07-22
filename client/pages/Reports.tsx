import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileText,
  Printer,
  RefreshCw,
  Search,
  Share2,
  Shield,
  User,
} from "lucide-react";
import { SatarkLayout } from "@/components/SatarkLayout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useApp } from "@/context/AppContext";

const moduleLabels: Record<string, string> = {
  digital_arrest: "Digital Arrest",
  counterfeit: "Counterfeit Detection",
  banking_fraud: "Citizen Fraud",
  fraud_network: "Fraud Network",
  other: "Other",
};

const riskStyle: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  new: "Draft",
  active: "Active",
  review: "Review",
  investigation: "Investigation",
  closed: "Completed",
};

const legalReferencesByType: Record<string, string[]> = {
  digital_arrest: [
    "MHA Cybercrime Circular 2024",
    "CERT-In Advisory on Government Impersonation Scams",
    "IPC Sections 419, 420, 120B",
  ],
  counterfeit: [
    "RBI Counterfeit Currency Detection Guidelines",
    "Narcotic and Psychotropic Substances Act for seizure cases",
    "IPC Sections 489A, 489B",
  ],
  banking_fraud: [
    "RBI UPI Fraud Advisory",
    "IT Act Section 66D",
    "Indian Evidence Act Section 65B",
  ],
  fraud_network: [
    "Inter-State Criminal Network Protocol",
    "IT Act Section 66F",
    "PMLA Reporting Requirements",
  ],
  other: [
    "Cybercrime Prevention Act",
    "IPC Sections 406, 420",
    "Best practice: preserve chain of custody",
  ],
};

const formatDate = (value?: Date) =>
  value ? value.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "-";

const formatDateTime = (value?: Date) =>
  value ? value.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "-";

const reportSections = [
  "Case Summary",
  "Incident Overview",
  "Victim Information",
  "Suspect Information",
  "Evidence Summary",
  "AI Findings",
  "Timeline",
  "Risk Assessment",
  "Recommendations",
  "Legal References",
  "Officer Notes",
] as const;

type ReportSectionKey = (typeof reportSections)[number];

export default function Reports() {
  const {
    investigations,
    reports,
    generateReport,
    getEvidenceByCase,
    getAnalysisSession,
  } = useApp();
  const [selectedCaseId, setSelectedCaseId] = useState<string>(investigations[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<ReportSectionKey, boolean>>(
    Object.fromEntries(reportSections.map((section) => [section, true])) as Record<ReportSectionKey, boolean>
  );

  useEffect(() => {
    if (!selectedCaseId && investigations.length > 0) {
      setSelectedCaseId(investigations[0].id);
    }
  }, [investigations, selectedCaseId]);

  const selectedInvestigation = investigations.find((item) => item.id === selectedCaseId);
  const selectedReport = reports.find((report) => report.investigationId === selectedCaseId);
  const selectedEvidence = selectedInvestigation ? getEvidenceByCase(selectedInvestigation.id) : [];
  const selectedSession = selectedInvestigation ? getAnalysisSession(selectedInvestigation.id) : undefined;

  const stats = useMemo(() => {
    const totalReports = reports.length;
    const todayReports = reports.filter((report) => {
      const now = new Date();
      return (
        report.generatedAt.getDate() === now.getDate() &&
        report.generatedAt.getMonth() === now.getMonth() &&
        report.generatedAt.getFullYear() === now.getFullYear()
      );
    }).length;

    const pending = investigations.filter((item) => ["new", "active", "review"].includes(item.status)).length;
    const completed = investigations.filter((item) => item.status === "closed").length;
    const drafts = investigations.filter((item) => item.status === "new").length;
    const highRiskCases = investigations.filter((item) => ["high", "critical"].includes(item.riskLevel)).length;

    return { totalReports, todayReports, pending, completed, drafts, highRiskCases };
  }, [investigations, reports]);

  const filteredInvestigations = useMemo(() => {
    const term = search.toLowerCase();
    return investigations
      .filter((item) => {
        const moduleLabel = moduleLabels[item.type] ?? item.type;
        const candidate = [
          item.id,
          item.citizenName,
          item.phoneNumber,
          item.upiId,
          item.assignedOfficer,
          moduleLabel,
          statusLabels[item.status],
          item.riskLevel,
          formatDate(item.createdAt),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const queryMatch = term ? candidate.includes(term) : true;
        if (!queryMatch) {
          return false;
        }

        switch (activeFilter) {
          case "Draft":
            return item.status === "new";
          case "Completed":
            return item.status === "closed";
          case "High Risk":
            return ["high", "critical"].includes(item.riskLevel);
          case "Digital Arrest":
            return item.type === "digital_arrest";
          case "Citizen Fraud":
            return item.type === "banking_fraud";
          case "Counterfeit":
            return item.type === "counterfeit";
          case "Recent":
            return (Date.now() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24) <= 7;
          default:
            return true;
        }
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [activeFilter, investigations, search]);

  const generate = async (id: string) => {
    setBusyId(id);
    try {
      await generateReport(id);
    } finally {
      setBusyId(null);
    }
  };

  const downloadReportJson = () => {
    if (!selectedReport) {
      return;
    }

    const payload = {
      report: selectedReport,
      investigation: selectedInvestigation,
    };
    const content = JSON.stringify(payload, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selectedInvestigation?.id ?? "investigation"}-report.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const toggleSection = (section: ReportSectionKey) => {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const reportFooterText = selectedReport
    ? `Report generated ${formatDateTime(selectedReport.generatedAt)}`
    : "No finalized report available. Use Generate Report to create a professional summary.";

  return (
    <SatarkLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Generate AI-powered investigation reports from completed investigations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <Button
              size="sm"
              onClick={() => selectedInvestigation && generate(selectedInvestigation.id)}
              disabled={!selectedInvestigation || busyId === selectedInvestigation?.id}
            >
              <RefreshCw className="w-4 h-4" />
              Generate Report
            </Button>
            <Button size="sm" variant="outline" disabled={!selectedReport}>
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <Button size="sm" variant="outline" disabled={!selectedReport}>
              <Download className="w-4 h-4" />
              Export DOCX
            </Button>
            <Button size="sm" variant="outline" disabled={!selectedReport} onClick={downloadReportJson}>
              <FileText className="w-4 h-4" />
              Export JSON
            </Button>
            <Button size="sm" variant="outline" disabled={!selectedReport}>
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button size="sm" variant="outline">
              <Search className="w-4 h-4" />
              Search Reports
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <Card className="p-4 xl:col-span-2">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base">Total Reports</CardTitle>
              <CardDescription>{stats.totalReports}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="p-4 xl:col-span-1">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base">Today's Reports</CardTitle>
              <CardDescription>{stats.todayReports}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="p-4 xl:col-span-1">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base">Pending</CardTitle>
              <CardDescription>{stats.pending}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="p-4 xl:col-span-1">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base">Completed</CardTitle>
              <CardDescription>{stats.completed}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="p-4 xl:col-span-1">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base">Drafts</CardTitle>
              <CardDescription>{stats.drafts}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="p-4 xl:col-span-1">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base">High Risk Cases</CardTitle>
              <CardDescription>{stats.highRiskCases}</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Investigation List</p>
                <p className="text-xs text-muted-foreground">Select a case to load the report preview.</p>
              </div>
              <div className="flex gap-2">
                {[
                  "All",
                  "Draft",
                  "Completed",
                  "High Risk",
                  "Digital Arrest",
                  "Citizen Fraud",
                  "Counterfeit",
                  "Recent",
                ].map((filter) => (
                  <Button
                    key={filter}
                    size="sm"
                    variant={activeFilter === filter ? "default" : "outline"}
                    onClick={() => setActiveFilter(filter)}
                    className="whitespace-nowrap"
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="Search by Case ID, Victim, Phone, Module, Officer, Risk"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="border-border"
              />

              <div className="space-y-3">
                {filteredInvestigations.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedCaseId(item.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      selectedCaseId === item.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{moduleLabels[item.type] ?? item.type}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.title}</p>
                      </div>
                      <Badge className={`text-xs ${riskStyle[item.riskLevel]}`}>
                        {item.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                      <div>
                        <p className="text-muted-foreground">Case</p>
                        <p className="text-foreground">{item.id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="text-foreground">{statusLabels[item.status] ?? item.status}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="text-foreground">{formatDate(item.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Officer</p>
                        <p className="text-foreground">{item.assignedOfficer ?? "Unassigned"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Victim</p>
                        <p className="text-foreground">{item.citizenName ?? "N/A"}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Live preview</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(event) => {
                          event.stopPropagation();
                          generate(item.id);
                        }}
                        disabled={busyId === item.id}
                      >
                        <RefreshCw className="w-4 h-4" />
                        {busyId === item.id ? "Generating" : "Generate"}
                      </Button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <Card className="overflow-hidden">
              <div className="bg-white p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold">S</div>
                        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">SATARK 360</div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold text-foreground">{selectedInvestigation?.title ?? "Select an investigation"}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{selectedInvestigation?.description ?? "Choose a case from the left panel to review the report preview."}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:w-72">
                    <div className="rounded-2xl border border-border bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Case Number</p>
                      <p className="font-semibold text-foreground mt-1">{selectedInvestigation?.id ?? "—"}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Generated</p>
                      <p className="font-semibold text-foreground mt-1">{selectedReport ? formatDateTime(selectedReport.generatedAt) : formatDate(selectedInvestigation?.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 border-t border-border bg-muted/50 p-6 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Officer</p>
                  <p className="mt-2 font-semibold text-foreground">{selectedInvestigation?.assignedOfficer ?? "Unassigned"}</p>
                </div>
                <div className="rounded-2xl border border-border bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Risk Level</p>
                  <p className="mt-2 font-semibold text-foreground">{selectedInvestigation?.riskLevel.toUpperCase() ?? "N/A"}</p>
                </div>
                <div className="rounded-2xl border border-border bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Classification</p>
                  <p className="mt-2 font-semibold text-foreground">{moduleLabels[selectedInvestigation?.type ?? "other"]}</p>
                </div>
              </div>

              <CardContent className="space-y-4 bg-white p-6">
                <div className="rounded-3xl border border-border bg-slate-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">AI Summary</p>
                  <p className="mt-3 text-sm leading-7 text-foreground">
                    {selectedInvestigation
                      ? `${moduleLabels[selectedInvestigation.type] ?? "Investigation"} flagged with ${selectedInvestigation.riskLevel.toUpperCase()} risk. ${selectedInvestigation.description}
                      ${selectedEvidence.length > 0 ? `Evidence package includes ${selectedEvidence.length} item${selectedEvidence.length > 1 ? "s" : ""}.` : "No evidence uploaded yet."}`
                      : "A selected case will populate a professional report preview with structured findings, timeline, and recommendations."}
                  </p>
                </div>

                {reportSections.map((section) => {
                  const open = openSections[section];
                  const title = section;

                  const content = (() => {
                    if (!selectedInvestigation) {
                      return "No case selected.";
                    }

                    switch (section) {
                      case "Case Summary":
                        return (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Case ID</p>
                              <p className="text-sm text-foreground font-semibold">{selectedInvestigation.id}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Module</p>
                              <p className="text-sm text-foreground font-semibold">{moduleLabels[selectedInvestigation.type]}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Assigned Officer</p>
                              <p className="text-sm text-foreground font-semibold">{selectedInvestigation.assignedOfficer ?? "Unassigned"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Location</p>
                              <p className="text-sm text-foreground font-semibold">{selectedInvestigation.location ? `${selectedInvestigation.location.city}, ${selectedInvestigation.location.state}` : "Unknown"}</p>
                            </div>
                          </div>
                        );
                      case "Incident Overview":
                        return (
                          <div className="space-y-3 text-sm text-foreground leading-7">
                            <p>{selectedInvestigation.description}</p>
                            <p>
                              Source: <span className="font-medium">{selectedInvestigation.source.replace(/_/g, " ")}</span>
                            </p>
                            {selectedInvestigation.phoneNumber && (
                              <p>Victim phone: {selectedInvestigation.phoneNumber}</p>
                            )}
                          </div>
                        );
                      case "Victim Information":
                        return (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Name</p>
                              <p className="text-sm text-foreground">{selectedInvestigation.citizenName ?? "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Phone</p>
                              <p className="text-sm text-foreground">{selectedInvestigation.phoneNumber ?? "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">UPI ID</p>
                              <p className="text-sm text-foreground">{selectedInvestigation.upiId ?? "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Victim Status</p>
                              <p className="text-sm text-foreground">{statusLabels[selectedInvestigation.status] ?? selectedInvestigation.status}</p>
                            </div>
                          </div>
                        );
                      case "Suspect Information":
                        return (
                          <div className="space-y-3 text-sm leading-7 text-foreground">
                            {selectedInvestigation.relatedEntityIds?.length ? (
                              <ul className="list-disc pl-5 space-y-2">
                                {selectedInvestigation.relatedEntityIds.map((entity) => (
                                  <li key={entity}>{entity}</li>
                                ))}
                              </ul>
                            ) : (
                              <p>No suspect entities have been linked yet.</p>
                            )}
                          </div>
                        );
                      case "Evidence Summary":
                        return (
                          <div className="space-y-3 text-sm leading-7 text-foreground">
                            <p className="font-medium">{selectedEvidence.length} evidence item{selectedEvidence.length === 1 ? "" : "s"} linked</p>
                            <div className="grid gap-2">
                              {selectedEvidence.map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center justify-between rounded-2xl border border-border bg-muted p-3"
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{file.type.toUpperCase()}</p>
                                  </div>
                                  <span className="text-xs text-muted-foreground">{formatDate(file.uploadedAt)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      case "AI Findings":
                        return (
                          <div className="space-y-3 text-sm leading-7 text-foreground">
                            {selectedInvestigation?.aiOutputs?.length ? (
                              selectedInvestigation.aiOutputs.slice(0, 3).map((output, index) => (
                                <div key={`${output.stage}-${index}`}>
                                  <p className="font-semibold">{output.title}</p>
                                  <p>{output.summary}</p>
                                </div>
                              ))
                            ) : (
                              <p>AI findings will populate as the investigation pipeline completes.</p>
                            )}
                          </div>
                        );
                      case "Timeline":
                        return (
                          <div className="space-y-3">
                            {selectedInvestigation.timeline.map((event) => (
                              <div key={event.id} className="rounded-2xl border border-border bg-muted p-3">
                                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                                  <span>{formatDateTime(event.timestamp)}</span>
                                  <Badge className={`text-[11px] ${riskStyle[event.severity]}`}>
                                    {event.severity.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="mt-2 font-medium text-sm text-foreground">{event.type.replace(/_/g, " ")}</p>
                                <p className="text-sm text-foreground mt-1">{event.description}</p>
                              </div>
                            ))}
                          </div>
                        );
                      case "Risk Assessment":
                        return (
                          <div className="space-y-3 text-sm leading-7 text-foreground">
                            <div className="grid gap-3 sm:grid-cols-3">
                              <div className="rounded-2xl border border-border bg-muted p-4">
                                <p className="text-xs text-muted-foreground">Risk Level</p>
                                <p className="mt-2 font-semibold text-foreground">{selectedInvestigation.riskLevel.toUpperCase()}</p>
                              </div>
                              <div className="rounded-2xl border border-border bg-muted p-4">
                                <p className="text-xs text-muted-foreground">Risk Score</p>
                                <p className="mt-2 font-semibold text-foreground">{selectedInvestigation.riskScore}%</p>
                              </div>
                              <div className="rounded-2xl border border-border bg-muted p-4">
                                <p className="text-xs text-muted-foreground">Case Status</p>
                                <p className="mt-2 font-semibold text-foreground">{statusLabels[selectedInvestigation.status] ?? selectedInvestigation.status}</p>
                              </div>
                            </div>
                            {selectedInvestigation.riskHistory?.length ? (
                              <ul className="list-disc pl-5 space-y-2 text-sm text-foreground">
                                {selectedInvestigation.riskHistory.slice(0, 3).map((risk, index) => (
                                  <li key={`${risk.investigationId}-${index}`}>{risk.factors.join(", ")}</li>
                                ))}
                              </ul>
                            ) : (
                              <p>No additional risk factors recorded.</p>
                            )}
                          </div>
                        );
                      case "Recommendations":
                        return (
                          <div className="space-y-3 text-sm leading-7 text-foreground">
                            <ul className="list-disc pl-5 space-y-2">
                              <li>Preserve the evidence chain and secure all linked devices.</li>
                              <li>Escalate the case to the cybercrime cell immediately.</li>
                              <li>Coordinate with financial institutions for account freezes if required.</li>
                            </ul>
                          </div>
                        );
                      case "Legal References":
                        return (
                          <div className="space-y-3 text-sm leading-7 text-foreground">
                            <ul className="list-disc pl-5 space-y-2">
                              {(legalReferencesByType[selectedInvestigation.type] || legalReferencesByType.other).map((reference) => (
                                <li key={reference}>{reference}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      case "Officer Notes":
                        return (
                          <div className="space-y-3 text-sm leading-7 text-foreground">
                            {selectedInvestigation.officerNotes?.length ? (
                              <ul className="list-disc pl-5 space-y-2">
                                {selectedInvestigation.officerNotes.map((note, index) => (
                                  <li key={`${note}-${index}`}>{note}</li>
                                ))}
                              </ul>
                            ) : (
                              <p>No officer notes have been added yet.</p>
                            )}
                          </div>
                        );
                      default:
                        return "";
                    }
                  })();

                  return (
                    <Card key={title} className="overflow-hidden border border-border">
                      <Collapsible open={open} onOpenChange={() => toggleSection(title)}>
                        <div className="flex items-center justify-between gap-3 border-b border-border bg-slate-50 px-5 py-4">
                          <div>
                            <h3 className="text-base font-semibold text-foreground">{title}</h3>
                            <p className="text-xs text-muted-foreground">{title === "AI Findings" ? "Key findings drawn from current investigation data." : ""}</p>
                          </div>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="p-2">
                              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="p-5">{content}</CollapsibleContent>
                      </Collapsible>
                    </Card>
                  );
                })}
              </CardContent>

              <CardFooter className="flex flex-col gap-2 bg-muted p-6 text-sm text-muted-foreground">
                {reportFooterText}
              </CardFooter>
            </Card>

            {selectedSession && selectedSession.status !== "completed" ? (
              <Card className="overflow-hidden">
                <CardHeader className="p-5">
                  <CardTitle className="text-base">Live Report Generation</CardTitle>
                  <CardDescription>Streaming generation — document assembly in progress.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-5">
                  <div className="space-y-2">
                    {selectedSession.stages.map((stage) => {
                      const completed = stage.status === "completed";
                      const active = stage.status === "running" || stage.status === "in_progress";
                      return (
                        <div key={stage.stage} className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center">
                            {completed ? (
                              <Badge className="bg-emerald-100 text-emerald-800">✓</Badge>
                            ) : active ? (
                              <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                            ) : (
                              <div className="h-3 w-3 rounded-full border border-slate-200 bg-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{stage.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{completed ? "Completed" : active ? "In progress" : "Pending"}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </section>

          <section className="space-y-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Report Actions</p>
                  <p className="text-xs text-muted-foreground">Export, share, and finalize the selected investigation report.</p>
                </div>
                <Badge className="bg-primary/10 text-primary">{selectedInvestigation?.riskLevel.toUpperCase() ?? "N/A"}</Badge>
              </div>

              <div className="grid gap-3">
                {[
                  { label: "Generate Report", icon: RefreshCw, onClick: () => selectedInvestigation && generate(selectedInvestigation.id), disabled: !selectedInvestigation },
                  { label: "Export PDF", icon: Download, onClick: () => null, disabled: !selectedReport },
                  { label: "Export DOCX", icon: Download, onClick: () => null, disabled: !selectedReport },
                  { label: "Copy", icon: Copy, onClick: () => navigator.clipboard.writeText(selectedReport?.content ?? ""), disabled: !selectedReport },
                  { label: "Print", icon: Printer, onClick: () => window.print(), disabled: !selectedReport },
                  { label: "Email", icon: Share2, onClick: () => null, disabled: !selectedReport },
                  { label: "Mark Final", icon: BadgeCheck, onClick: () => null, disabled: !selectedReport },
                  { label: "Generate FIR", icon: FileText, onClick: () => null, disabled: !selectedReport },
                  { label: "Generate Cyber Cell Report", icon: Shield, onClick: () => null, disabled: !selectedReport },
                ].map((action) => (
                  <Button
                    key={action.label}
                    size="sm"
                    variant={action.disabled ? "outline" : "default"}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className="justify-start"
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Evidence Overview</p>
                  <p className="text-xs text-muted-foreground">Images, audio, video and documents linked to the active case.</p>
                </div>
              </div>
              <div className="space-y-2">
                {selectedEvidence.length > 0 ? (
                  selectedEvidence.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      className="w-full rounded-2xl border border-border bg-muted p-4 text-left transition hover:border-primary/80"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-sm text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.type.toUpperCase()}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(file.uploadedAt)}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No evidence items are linked to this case yet.</p>
                )}

                <Link to="/evidence" className="inline-flex w-full items-center justify-center rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/80">
                  View full evidence repository
                </Link>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </SatarkLayout>
  );
}
