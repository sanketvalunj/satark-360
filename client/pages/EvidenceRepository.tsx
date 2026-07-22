import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  ArrowUpRight,
  Mic,
  Camera,
  Download,
  FileArchive,
  FileText,
  Film,
  FolderPlus,
  Grid,
  Image,
  Link2,
  Lock,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  TextCursor,
  User,
  Wifi,
} from "lucide-react";
import { SatarkLayout } from "@/components/SatarkLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useApp } from "@/context/AppContext";

const badgeStyles: Record<string, string> = {
  image: "bg-violet-100 text-violet-800",
  video: "bg-sky-100 text-sky-800",
  audio: "bg-emerald-100 text-emerald-800",
  pdf: "bg-orange-100 text-orange-800",
  text: "bg-slate-100 text-slate-800",
};

const cardTypeLabel: Record<string, string> = {
  image: "Image",
  video: "Video",
  audio: "Audio",
  pdf: "PDF",
  text: "Transcript",
  qr: "QR",
};

const moduleLabels: Record<string, string> = {
  digital_arrest: "Digital Arrest",
  counterfeit: "Counterfeit Detection",
  banking_fraud: "Citizen Fraud",
  fraud_network: "Fraud Network",
  other: "Case Management",
};

const statusLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const formatDate = (value?: Date) =>
  value
    ? value.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

const formatDateTime = (value?: Date) =>
  value
    ? value.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "-";

const formatSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(0)} KB`;
};

const filterKeys = [
  "All",
  "Images",
  "Audio",
  "Video",
  "PDF",
  "OCR",
  "Transcript",
  "High Risk",
  "Recent",
  "Bookmarked",
] as const;

type FilterKey = (typeof filterKeys)[number];

export default function EvidenceRepository() {
  const { evidence, investigations } = useApp();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);

  const selectedEvidence = evidence.find((item) => item.id === selectedEvidenceId);
  const selectedInvestigation = selectedEvidence
    ? investigations.find((item) => item.id === selectedEvidence.caseId)
    : undefined;

  const counts = useMemo(() => {
    const total = evidence.length;
    const images = evidence.filter((item) => item.type === "image").length;
    const videos = evidence.filter((item) => item.type === "video").length;
    const audio = evidence.filter((item) => item.type === "audio").length;
    const pdf = evidence.filter((item) => item.type === "pdf").length;
    const transcripts = evidence.filter(
      (item) => item.type === "text" || item.metadata?.category === "transcript"
    ).length;
    const ocr = evidence.filter((item) => item.metadata?.category === "ocr").length;

    return { total, images, videos, audio, pdf, transcripts, ocr };
  }, [evidence]);

  const filteredEvidence = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...evidence]
      .filter((item) => {
        const investigation = investigations.find((record) => record.id === item.caseId);
        const candidate = [
          item.id,
          item.name,
          item.caseId,
          investigation?.citizenName,
          investigation?.phoneNumber,
          investigation?.upiId,
          investigation?.location?.city,
          investigation?.location?.state,
          item.metadata?.ocrText,
          item.metadata?.transcript,
          item.metadata?.source,
          item.metadata?.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = query ? candidate.includes(query) : true;
        if (!matchesSearch) {
          return false;
        }

        switch (activeFilter) {
          case "Images":
            return item.type === "image";
          case "Audio":
            return item.type === "audio";
          case "Video":
            return item.type === "video";
          case "PDF":
            return item.type === "pdf";
          case "OCR":
            return item.metadata?.category === "ocr";
          case "Transcript":
            return item.type === "text" || item.metadata?.category === "transcript";
          case "High Risk":
            return ["high", "critical"].includes(investigation?.riskLevel ?? "");
          case "Recent":
            return Date.now() - item.uploadedAt.getTime() <= 7 * 24 * 60 * 60 * 1000;
          case "Bookmarked":
            return Boolean(item.metadata?.bookmarked);
          default:
            return true;
        }
      })
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }, [activeFilter, evidence, investigations, search]);

  const openViewer = (evidenceItem: typeof evidence[number]) => {
    setSelectedEvidenceId(evidenceItem.id);
    setViewerOpen(true);
  };

  return (
    <SatarkLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3 text-foreground">
              <Archive className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Evidence Repository</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Centralized forensic evidence vault for all investigations.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Button size="sm" className="whitespace-nowrap">
              <FolderPlus className="w-4 h-4" />
              New Upload
            </Button>
            <Button size="sm" variant="outline" className="whitespace-nowrap">
              <Download className="w-4 h-4" />
              Export Evidence
            </Button>
            <Button size="sm" variant="outline" className="whitespace-nowrap">
              <Sparkles className="w-4 h-4" />
              Generate Chain of Custody
            </Button>
            <Button size="sm" variant="outline" className="whitespace-nowrap">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-8">
          {[
            { label: "Total Evidence", value: counts.total },
            { label: "Images", value: counts.images },
            { label: "Videos", value: counts.videos },
            { label: "Audio", value: counts.audio },
            { label: "PDF", value: counts.pdf },
            { label: "Transcripts", value: counts.transcripts },
            { label: "OCR Documents", value: counts.ocr },
          ].map((item) => (
            <Card key={item.label} className="p-4 xl:col-span-1">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-sm font-semibold">{item.label}</CardTitle>
                <CardDescription>{item.value}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Search evidence by Case ID, Phone, UPI, Person, Evidence ID, Location, Filename, OCR text, Transcript"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="border-border"
          />

          <div className="flex flex-wrap gap-2">
            {filterKeys.map((filter) => (
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

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredEvidence.map((item) => {
                const investigation = investigations.find((record) => record.id === item.caseId);
                const source = item.metadata?.source ?? investigation?.type ?? "Unknown";
                const risk = investigation?.riskLevel ? statusLabels[investigation.riskLevel] : "Unknown";
                const verified = Boolean(item.metadata?.verified);

                return (
                  <Card
                    key={item.id}
                    className="cursor-pointer overflow-hidden border border-border bg-card transition hover:border-primary/70"
                    onClick={() => openViewer(item)}
                  >
                    <CardContent className="space-y-4 p-4">
                      <div className="grid gap-4 sm:grid-cols-[auto_1fr] items-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-border bg-muted">
                          {item.type === "image" ? <Image className="h-7 w-7 text-violet-600" /> : null}
                          {item.type === "video" ? <Film className="h-7 w-7 text-sky-600" /> : null}
                          {item.type === "audio" ? <Audio className="h-7 w-7 text-emerald-600" /> : null}
                          {item.type === "pdf" ? <FileArchive className="h-7 w-7 text-orange-600" /> : null}
                          {item.type === "text" ? <FileText className="h-7 w-7 text-slate-600" /> : null}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.id}</p>
                        </div>
                      </div>

                      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                        <div>
                          <p>Case ID</p>
                          <p className="text-foreground">{item.caseId}</p>
                        </div>
                        <div>
                          <p>Uploaded</p>
                          <p className="text-foreground">{formatDateTime(item.uploadedAt)}</p>
                        </div>
                        <div>
                          <p>Source</p>
                          <p className="text-foreground">{moduleLabels[(source as string) as keyof typeof moduleLabels] ?? source}</p>
                        </div>
                        <div>
                          <p>Risk Level</p>
                          <p className="text-foreground">{risk}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={badgeStyles[item.type] ?? "bg-slate-100 text-slate-800"}>
                          {cardTypeLabel[item.type] ?? item.type}
                        </Badge>
                        {verified ? (
                          <Badge className="bg-emerald-100 text-emerald-800">AI Verified</Badge>
                        ) : null}
                        <Badge className="bg-muted text-muted-foreground">{formatSize(item.size)}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base">View Details</CardTitle>
                <CardDescription>
                  Select evidence to inspect preview, metadata, extracted entities, and chain of custody.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-0">
                {selectedEvidence ? (
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-border bg-muted p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Selected Evidence</p>
                      <p className="mt-2 font-semibold text-foreground">{selectedEvidence.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedEvidence.id}</p>
                    </div>
                    <div className="grid gap-3 text-sm text-foreground">
                      <div>
                        <p className="text-xs text-muted-foreground">Case</p>
                        <Link to="/cases" className="font-semibold text-primary hover:underline">
                          {selectedEvidence.caseId}
                        </Link>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Module Source</p>
                        <p>{moduleLabels[(selectedEvidence.metadata?.source as string) ?? selectedInvestigation?.type ?? "other"]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p>{selectedEvidence.metadata?.status ?? "Available"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Hash</p>
                        <p className="font-mono text-xs text-foreground">{selectedEvidence.metadata?.hash ?? "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Choose an evidence item to review detailed metadata and timeline.</p>
                )}
              </CardContent>
            </Card>

            {selectedEvidence ? (
              <Card className="p-5 space-y-4">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <div className="grid gap-3">
                  <Button size="sm" className="justify-start">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" className="justify-start">
                    <ArrowUpRight className="w-4 h-4" />
                    Copy Link
                  </Button>
                  <Button size="sm" variant="outline" className="justify-start">
                    <Link2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </Card>
            ) : null}
          </div>
        </div>

        <Sheet open={viewerOpen} onOpenChange={setViewerOpen}>
          <SheetContent side="right" className="max-w-2xl">
            {selectedEvidence ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">{selectedEvidence.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">Evidence ID {selectedEvidence.id}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary">{cardTypeLabel[selectedEvidence.type] ?? selectedEvidence.type}</Badge>
                </div>
                <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                  <div className="rounded-3xl border border-border bg-muted p-4">
                    <div className="flex h-64 items-center justify-center rounded-3xl border border-border bg-white">
                      {selectedEvidence.type === "image" ? (
                        <Image className="h-12 w-12 text-violet-600" />
                      ) : selectedEvidence.type === "video" ? (
                        <Film className="h-12 w-12 text-sky-600" />
                      ) : selectedEvidence.type === "audio" ? (
                        <Audio className="h-12 w-12 text-emerald-600" />
                      ) : selectedEvidence.type === "pdf" ? (
                        <FileArchive className="h-12 w-12 text-orange-600" />
                      ) : (
                        <FileText className="h-12 w-12 text-slate-600" />
                      )}
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-foreground">
                      <div>
                        <p className="text-xs text-muted-foreground">Preview</p>
                        <p className="font-medium">{selectedEvidence.metadata?.preview ?? "Preview is available in the native evidence viewer."}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">File size</p>
                        <p>{formatSize(selectedEvidence.size)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Uploaded</p>
                        <p>{formatDateTime(selectedEvidence.uploadedAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Card className="border border-border bg-white p-4">
                      <CardHeader className="p-0 pb-3">
                        <CardTitle className="text-base">Evidence Metadata</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 space-y-3 text-sm text-foreground">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Case</p>
                            <p>{selectedEvidence.caseId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Source</p>
                            <p>{moduleLabels[(selectedEvidence.metadata?.source as string) ?? selectedInvestigation?.type ?? "other"]}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Inspector</p>
                            <p>{selectedInvestigation?.assignedOfficer ?? "Unassigned"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Risk</p>
                            <p>{statusLabels[selectedInvestigation?.riskLevel ?? "low"]}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-border bg-white p-4">
                      <CardHeader className="p-0 pb-3">
                        <CardTitle className="text-base">AI Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 text-sm leading-7 text-foreground">
                        <p>{selectedEvidence.metadata?.aiSummary ?? "No AI summary available for this evidence item."}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {selectedEvidence.metadata?.extractedEntities ? (
                  <Card className="border border-border bg-white p-4">
                    <CardHeader className="p-0 pb-3">
                      <CardTitle className="text-base">Extracted Entities</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-3">
                      {Object.entries(selectedEvidence.metadata.extractedEntities).map(([category, values]) => (
                        <div key={category}>
                          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{category}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(values as string[]).map((value) => (
                              <Button key={value} size="sm" variant="outline" className="rounded-full py-1 px-2 text-xs">
                                {value}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : null}

                {selectedEvidence.metadata?.ocrText ? (
                  <Card className="border border-border bg-white p-4">
                    <CardHeader className="p-0 pb-3">
                      <CardTitle className="text-base">OCR / Transcript</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <pre className="max-h-48 overflow-auto rounded-2xl bg-slate-50 p-4 text-sm text-foreground">{selectedEvidence.metadata.ocrText}</pre>
                    </CardContent>
                  </Card>
                ) : null}

                <Card className="border border-border bg-white p-4">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-base">Chain of Custody</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-3 text-sm text-foreground">
                    {(selectedEvidence.metadata?.chainOfCustody ?? []).map((event: any) => (
                      <div key={event.timestamp} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{event.action}</p>
                          <span className="text-xs text-muted-foreground">{formatDateTime(new Date(event.timestamp))}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Officer: {event.officer}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-3xl border border-border bg-muted p-6 text-sm text-muted-foreground">
                  Select evidence from the grid to view its metadata, extracted entities, OCR/transcript content, and custody timeline.
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </SatarkLayout>
  );
}
