import { useEffect, useMemo, useState } from "react";
import { SatarkLayout } from "@/components/SatarkLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Bell,
    Building2,
    CalendarDays,
    Command,
    Cpu,
    Database,
    FileText,
    Gauge,
    Globe,
    MapPinned,
    Network,
    Radar,
    ShieldAlert,
    Satellite,
    Server,
    TimerReset,
    Users,
} from "lucide-react";

type CommandEvent = {
    id: string;
    title: string;
    detail: string;
    timestamp: Date;
    severity: "critical" | "high" | "medium" | "low";
    district: string;
    module: string;
    x: number;
    y: number;
};

type Telemetry = {
    cpu: number;
    gpu: number;
    memory: number;
    rpm: number;
    processingMs: number;
};

const severityStyles = {
    critical: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-blue-100 text-blue-800 border-blue-200",
} as const;

const eventTemplates = [
    {
        title: "Citizen Complaint Received",
        module: "Citizen Fraud Shield",
        severity: "medium" as const,
        detail: (city: string) => `New complaint arrived from ${city} and entered evidence collection.`,
    },
    {
        title: "Suspicious Call Detected",
        module: "Digital Arrest Detection",
        severity: "critical" as const,
        detail: (city: string) => `Police impersonation transcript flagged in ${city}. Speech and caller agents engaged.`,
    },
    {
        title: "UPI Fraud Detected",
        module: "Fraud Network",
        severity: "high" as const,
        detail: (city: string) => `UPI transfer chain expanded around ${city} and linked to the active network wall.`,
    },
    {
        title: "Counterfeit Currency Uploaded",
        module: "Counterfeit Detection",
        severity: "high" as const,
        detail: (city: string) => `Suspected note evidence from ${city} moved into validation and explainable AI.`,
    },
    {
        title: "New Entity Linked",
        module: "Graph Intelligence",
        severity: "medium" as const,
        detail: (city: string) => `Entity resolution connected a new phone, bank, and location node in ${city}.`,
    },
    {
        title: "Hotspot Increased",
        module: "Geo Intelligence",
        severity: "high" as const,
        detail: (city: string) => `Crime density rose in ${city} as incoming investigations updated the heatmap.`,
    },
    {
        title: "Officer Assigned",
        module: "Command Operations",
        severity: "low" as const,
        detail: (city: string) => `Cybercrime desk assigned an officer to ${city} for live monitoring.`,
    },
    {
        title: "Investigation Closed",
        module: "Reports",
        severity: "low" as const,
        detail: (city: string) => `Court-ready report generated and the case in ${city} was closed for review.`,
    },
];

const officerRoster = [
    "Inspector Sharma",
    "ACP Verma",
    "Officer Iyer",
    "Det. Kumar",
    "Analyst Mehta",
    "Cyber Ops Desk",
    "Field Officer Singh",
    "Watch Commander Rao",
];

const mapFilters = ["all", "critical", "high", "medium", "low"] as const;

export default function NationalCommandCenter() {
    const {
        investigations,
        alerts,
        analysisSessions,
        locations,
        graphNodes,
        graphEdges,
        notifications,
        evidence,
        getStats,
        getActiveAnalysisSessions,
    } = useApp();

    const stats = getStats();
    const activeAnalysisSessions = getActiveAnalysisSessions();
    const [commandMode, setCommandMode] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [eventStream, setEventStream] = useState<CommandEvent[]>([]);
    const [mapFilter, setMapFilter] = useState<(typeof mapFilters)[number]>("all");
    const [telemetry, setTelemetry] = useState<Telemetry>({
        cpu: 52,
        gpu: 41,
        memory: 58,
        rpm: 128,
        processingMs: 148,
    });

    const districtRiskRanking = useMemo(() => {
        const weight = { critical: 96, high: 78, medium: 58, low: 34 } as const;
        return [...locations]
            .map((location) => ({
                ...location,
                score: Math.min(99, Math.round(weight[location.risk] + location.caseCount * 1.4)),
            }))
            .sort((left, right) => right.score - left.score)
            .slice(0, 6);
    }, [locations]);

    const stateRiskRanking = useMemo(() => {
        const grouped = new Map<string, { state: string; score: number; cases: number }>();
        locations.forEach((location) => {
            const current = grouped.get(location.state) ?? { state: location.state, score: 0, cases: 0 };
            const scoreWeight = location.risk === "critical" ? 9 : location.risk === "high" ? 7 : location.risk === "medium" ? 5 : 3;
            grouped.set(location.state, {
                state: location.state,
                score: Math.min(99, current.score + scoreWeight + location.caseCount * 0.5),
                cases: current.cases + location.caseCount,
            });
        });
        return Array.from(grouped.values())
            .sort((left, right) => right.score - left.score)
            .slice(0, 6);
    }, [locations]);

    const overallIndiaRisk = useMemo(() => {
        const alertPressure = alerts.filter((alert) => !alert.resolved).length * 4;
        const sessionPressure = activeAnalysisSessions.length * 5;
        const casePressure = stats.totalCases * 1.7;
        const hotZonePressure = districtRiskRanking[0]?.score ?? 0;
        return Math.min(99, Math.round((alertPressure + sessionPressure + casePressure + hotZonePressure) / 3.1));
    }, [activeAnalysisSessions.length, alerts, districtRiskRanking, stats.totalCases]);

    const liveInvestigationQueue = useMemo(() => {
        return analysisSessions
            .filter((session) => session.status !== "completed")
            .slice(0, 6)
            .map((session) => ({
                id: session.investigationId,
                title: session.currentStageLabel,
                progress: session.liveProgress,
                confidence: session.confidenceScore,
            }));
    }, [analysisSessions]);

    const combinedTimeline = useMemo(() => {
        return [...analysisSessions.flatMap((session) => session.stageLog)].sort(
            (left, right) => right.timestamp.getTime() - left.timestamp.getTime()
        ).slice(0, 12);
    }, [analysisSessions]);

    const dashboardStats = useMemo(() => {
        const completedSessions = analysisSessions.filter((session) => session.completedAt);
        const averageTime = completedSessions.length
            ? Math.round(
                completedSessions.reduce((sum, session) => sum + ((session.completedAt?.getTime() ?? 0) - session.createdAt.getTime()) / 60000, 0) /
                completedSessions.length
            )
            : 0;
        const averageConfidence = analysisSessions.length
            ? Math.round(analysisSessions.reduce((sum, session) => sum + session.confidenceScore, 0) / analysisSessions.length)
            : 0;
        const officerBusy = Math.min(officerRoster.length, Math.max(2, activeAnalysisSessions.length + 2));
        const uploadsPerHour = evidence.length * 1.8 + activeAnalysisSessions.length * 2.2;

        return {
            averageTime,
            averageConfidence,
            officerBusy,
            officerAvailable: officerRoster.length - officerBusy,
            uploadsPerHour: Math.round(uploadsPerHour),
        };
    }, [activeAnalysisSessions.length, analysisSessions, evidence.length]);

    useEffect(() => {
        setEventStream([
            {
                id: "seed-1",
                title: "Command Center Online",
                detail: "National operations dashboard initialized and linked to the shared investigation engine.",
                timestamp: new Date(),
                severity: "medium",
                district: districtRiskRanking[0]?.city ?? "Mumbai",
                module: "Command Operations",
                x: 52,
                y: 45,
            },
        ]);
    }, [districtRiskRanking]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            const location = locations[Math.floor(Math.random() * Math.max(1, locations.length))];
            const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
            const title = template.title;
            const city = location?.city ?? "Mumbai";

            const event: CommandEvent = {
                id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                title,
                detail: template.detail(city),
                timestamp: new Date(),
                severity: template.severity,
                district: city,
                module: template.module,
                x: 15 + Math.floor(Math.random() * 70),
                y: 12 + Math.floor(Math.random() * 68),
            };

            setEventStream((prev) => [event, ...prev].slice(0, 14));
            setTelemetry((prev) => ({
                cpu: Math.min(98, Math.max(28, prev.cpu + (Math.random() > 0.5 ? 4 : -3) + (commandMode ? 2 : 0))),
                gpu: Math.min(96, Math.max(18, prev.gpu + (Math.random() > 0.5 ? 5 : -4))),
                memory: Math.min(94, Math.max(32, prev.memory + (Math.random() > 0.5 ? 2 : -2))),
                rpm: Math.min(240, Math.max(80, prev.rpm + (Math.random() > 0.5 ? 14 : -10))),
                processingMs: Math.min(280, Math.max(92, prev.processingMs + (Math.random() > 0.5 ? 8 : -7))),
            }));
        }, commandMode ? 1800 : 3600);

        return () => window.clearInterval(interval);
    }, [commandMode, locations]);

    const liveHeatmapLocations = useMemo(() => {
        return [...locations]
            .filter((location) => mapFilter === "all" || location.risk === mapFilter)
            .map((location) => ({
                ...location,
                score: Math.min(99, Math.round(location.caseCount * 6 + (location.risk === "critical" ? 30 : location.risk === "high" ? 20 : 10))),
                intensity: Math.min(100, location.caseCount * 6 + (location.risk === "critical" ? 30 : location.risk === "high" ? 20 : 10)),
            }));
    }, [locations, mapFilter]);

    const mappedNodes = useMemo(() => {
        return graphNodes.slice(0, 12).map((node, index) => ({
            ...node,
            angle: (index / Math.max(1, graphNodes.length)) * Math.PI * 2,
        }));
    }, [graphNodes]);

    const notificationsByPriority = useMemo(() => {
        const merged = [
            ...notifications.map((item) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                timestamp: item.timestamp,
                severity: item.severity,
            })),
            ...alerts.map((alert) => ({
                id: alert.id,
                title: alert.title,
                description: alert.description,
                timestamp: alert.timestamp,
                severity: alert.severity,
            })),
        ];

        return merged.sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime());
    }, [alerts, notifications]);

    const officerAvailability = useMemo(() => {
        return officerRoster.map((officer, index) => {
            const mod = (index + activeAnalysisSessions.length + alerts.length) % 3;
            return {
                officer,
                status: mod === 0 ? "Available" : mod === 1 ? "Deployed" : "On Case",
                badge: mod === 0 ? "bg-green-100 text-green-800" : mod === 1 ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800",
            };
        });
    }, [activeAnalysisSessions.length, alerts.length]);

    const eventSeverityStats = useMemo(() => {
        return eventStream.reduce(
            (acc, item) => {
                acc[item.severity] += 1;
                return acc;
            },
            { critical: 0, high: 0, medium: 0, low: 0 }
        );
    }, [eventStream]);

    return (
        <SatarkLayout>
            <div className={cn("p-6 md:p-8 space-y-6", commandMode && "space-y-8")}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/25">
                                <Command className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                                    National Command Center
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    India cyber crime headquarters live operations hub
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setCommandMode((prev) => !prev)}
                            className={cn(
                                "transition-all",
                                commandMode && "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}
                        >
                            {commandMode ? "Command Mode" : "Normal Mode"}
                        </Button>
                        <Button variant="outline" onClick={() => setNotificationOpen(true)}>
                            <Bell className="w-4 h-4 mr-2" />
                            Notifications
                        </Button>
                    </div>
                </div>

                <div className={cn(
                    "grid gap-4",
                    commandMode ? "grid-cols-2 xl:grid-cols-7" : "grid-cols-2 xl:grid-cols-4"
                )}>
                    <Card className="p-5 card-hover">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Live Investigations</p>
                        <div className="mt-2 flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-foreground">{stats.totalCases}</h3>
                            <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{stats.activeCases} active today</p>
                    </Card>
                    <Card className="p-5 card-hover">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Active AI Agents</p>
                        <div className="mt-2 flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-foreground">{activeAnalysisSessions.reduce((sum, session) => sum + session.runningAgents, 0)}</h3>
                            <Cpu className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Parallel intelligence workloads</p>
                    </Card>
                    <Card className="p-5 card-hover">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Critical Alerts</p>
                        <div className="mt-2 flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-foreground">{alerts.filter((alert) => alert.severity === "critical" && !alert.resolved).length}</h3>
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Unresolved national priorities</p>
                    </Card>
                    <Card className="p-5 card-hover">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Digital Arrest Sessions</p>
                        <div className="mt-2 flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-foreground">{stats.digitalArrestCases}</h3>
                            <Satellite className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Live coercion investigations</p>
                    </Card>
                    <Card className="p-5 card-hover">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Counterfeit Cases</p>
                        <div className="mt-2 flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-foreground">{stats.counterfeitCases}</h3>
                            <Database className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Currency forensics queue</p>
                    </Card>
                    <Card className="p-5 card-hover">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">AI Confidence</p>
                        <div className="mt-2 flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-foreground">
                                {analysisSessions.length
                                    ? Math.round(analysisSessions.reduce((sum, session) => sum + session.confidenceScore, 0) / analysisSessions.length)
                                    : 0}%
                            </h3>
                            <Gauge className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Fusion confidence average</p>
                    </Card>
                    <Card className="p-5 card-hover">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Today's Statistics</p>
                        <div className="mt-2 flex items-end justify-between">
                            <h3 className="text-3xl font-bold text-foreground">{Math.max(1, evidence.length + alerts.length)}</h3>
                            <CalendarDays className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Evidence, alerts, and reports</p>
                    </Card>
                </div>

                <div className={cn("grid gap-6", commandMode ? "xl:grid-cols-12" : "xl:grid-cols-12")}>
                    <Card className={cn("p-6 card-hover xl:col-span-7 min-h-[540px]", commandMode && "min-h-[650px]")}>
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Live Operations Map</h3>
                                <p className="text-sm text-muted-foreground mt-1">Animated hotspots, district risk, police stations, and incidents across India</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {mapFilters.map((filter) => (
                                    <Button
                                        key={filter}
                                        variant={mapFilter === filter ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setMapFilter(filter)}
                                        className="capitalize"
                                    >
                                        {filter}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-sky-50 via-white to-slate-100 min-h-[460px]">
                            <svg viewBox="0 0 900 850" className="absolute inset-0 h-full w-full opacity-30">
                                <path d="M290 160 L510 140 L560 195 L595 180 L620 240 L635 310 L590 360 L555 410 L495 435 L430 470 L380 495 L325 485 L285 430 L300 360 L320 300 L300 245 L275 205 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-400" />
                            </svg>

                            <div className="absolute inset-0">
                                {liveHeatmapLocations.map((location, index) => (
                                    <div
                                        key={`${location.city}-${index}`}
                                        className="absolute rounded-full border border-white/70 shadow-lg animate-pulse"
                                        style={{
                                            left: `${18 + (index % 4) * 18}%`,
                                            top: `${18 + (index % 5) * 12}%`,
                                            width: `${36 + location.intensity / 2}px`,
                                            height: `${36 + location.intensity / 2}px`,
                                            backgroundColor: location.risk === "critical" ? "rgba(220,38,38,0.4)" : location.risk === "high" ? "rgba(234,88,12,0.35)" : "rgba(59,130,246,0.3)",
                                        }}
                                        title={`${location.city} risk ${location.score}%`}
                                    />
                                ))}
                                {eventStream.slice(0, 5).map((event) => (
                                    <div
                                        key={event.id}
                                        className="absolute rounded-full border border-white bg-white/90 px-3 py-1 text-[11px] font-semibold shadow-lg animate-pulse"
                                        style={{ left: `${event.x}%`, top: `${event.y}%` }}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                            </div>

                            <div className="relative z-10 h-full min-h-[460px] p-6 flex flex-col justify-between">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {liveHeatmapLocations.slice(0, 4).map((location) => (
                                        <div key={location.city} className="rounded-xl bg-white/85 backdrop-blur border border-border p-3">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <p className="text-sm font-semibold text-foreground">{location.city}</p>
                                                <Badge className={severityStyles[location.risk]}>{location.risk}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{location.state}</p>
                                            <div className="mt-3">
                                                <Progress value={location.intensity} className="h-2" />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">{location.caseCount} cases</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                    <div className="rounded-xl bg-white/85 backdrop-blur border border-border p-3">
                                        <p className="text-xs text-muted-foreground">Moving Alerts</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">{eventStream.length}</p>
                                    </div>
                                    <div className="rounded-xl bg-white/85 backdrop-blur border border-border p-3">
                                        <p className="text-xs text-muted-foreground">Police Stations</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">{Math.max(24, locations.length * 6)}</p>
                                    </div>
                                    <div className="rounded-xl bg-white/85 backdrop-blur border border-border p-3">
                                        <p className="text-xs text-muted-foreground">District Risk</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">{districtRiskRanking[0]?.score ?? 0}%</p>
                                    </div>
                                    <div className="rounded-xl bg-white/85 backdrop-blur border border-border p-3">
                                        <p className="text-xs text-muted-foreground">Heat Intensity</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">{Math.round(liveHeatmapLocations.reduce((sum, location) => sum + location.intensity, 0) / Math.max(1, liveHeatmapLocations.length))}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="xl:col-span-5 space-y-6">
                        <Card className="p-6 card-hover">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">National Risk Index</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Overall, state, and district risk projections</p>
                                </div>
                                <Radar className="w-6 h-6 text-primary" />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                        <span>Overall India Risk</span>
                                        <span>{overallIndiaRisk}%</span>
                                    </div>
                                    <Progress value={overallIndiaRisk} className="h-3" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                        <span>State Risk</span>
                                        <span>{stateRiskRanking[0]?.score ?? 0}%</span>
                                    </div>
                                    <Progress value={stateRiskRanking[0]?.score ?? 0} className="h-3" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                        <span>District Risk</span>
                                        <span>{districtRiskRanking[0]?.score ?? 0}%</span>
                                    </div>
                                    <Progress value={districtRiskRanking[0]?.score ?? 0} className="h-3" />
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="rounded-xl border border-border bg-muted/20 p-3">
                                        <p className="text-xs text-muted-foreground">Trend</p>
                                        <p className="text-lg font-bold text-foreground mt-1 flex items-center gap-1">
                                            <ArrowUpRight className="w-4 h-4 text-red-500" />
                                            Rising
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-border bg-muted/20 p-3">
                                        <p className="text-xs text-muted-foreground">Prediction</p>
                                        <p className="text-lg font-bold text-foreground mt-1 flex items-center gap-1">
                                            <ArrowDownRight className="w-4 h-4 text-green-500" />
                                            Stabilizing
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 card-hover">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">AI Operations Panel</h3>
                                    <p className="text-sm text-muted-foreground mt-1">System load, queue, and processing telemetry</p>
                                </div>
                                <Cpu className="w-6 h-6 text-primary" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-border bg-muted/20 p-3">
                                    <p className="text-xs text-muted-foreground">Currently Running AI Agents</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{activeAnalysisSessions.reduce((sum, session) => sum + session.runningAgents, 0)}</p>
                                </div>
                                <div className="rounded-xl border border-border bg-muted/20 p-3">
                                    <p className="text-xs text-muted-foreground">Queue</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{liveInvestigationQueue.length}</p>
                                </div>
                                <div className="rounded-xl border border-border bg-muted/20 p-3">
                                    <p className="text-xs text-muted-foreground">CPU Usage</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{telemetry.cpu}%</p>
                                </div>
                                <div className="rounded-xl border border-border bg-muted/20 p-3">
                                    <p className="text-xs text-muted-foreground">GPU Usage</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{telemetry.gpu}%</p>
                                </div>
                                <div className="rounded-xl border border-border bg-muted/20 p-3">
                                    <p className="text-xs text-muted-foreground">Memory</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{telemetry.memory}%</p>
                                </div>
                                <div className="rounded-xl border border-border bg-muted/20 p-3">
                                    <p className="text-xs text-muted-foreground">Requests / Min</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{telemetry.rpm}</p>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                        <span>CPU</span>
                                        <span>{telemetry.cpu}%</span>
                                    </div>
                                    <Progress value={telemetry.cpu} className="h-2" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                        <span>GPU</span>
                                        <span>{telemetry.gpu}%</span>
                                    </div>
                                    <Progress value={telemetry.gpu} className="h-2" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                        <span>Memory</span>
                                        <span>{telemetry.memory}%</span>
                                    </div>
                                    <Progress value={telemetry.memory} className="h-2" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                        <span>Processing</span>
                                        <span>{telemetry.processingMs}ms</span>
                                    </div>
                                    <Progress value={Math.min(100, telemetry.processingMs / 3)} className="h-2" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 card-hover">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">District Risk Ranking</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Highest pressure districts in the country</p>
                                </div>
                                <Globe className="w-6 h-6 text-primary" />
                            </div>

                            <div className="space-y-3">
                                {districtRiskRanking.map((district, index) => (
                                    <div key={district.city} className="rounded-xl border border-border bg-muted/20 p-3">
                                        <div className="flex items-center justify-between gap-3 mb-2">
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">#{index + 1} {district.city}</p>
                                                <p className="text-xs text-muted-foreground">{district.state}</p>
                                            </div>
                                            <Badge className={severityStyles[district.risk]}>{district.score}%</Badge>
                                        </div>
                                        <Progress value={district.score} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-6 card-hover">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Officer Availability</h3>
                                    <p className="text-sm text-muted-foreground mt-1">National command staffing levels</p>
                                </div>
                                <Users className="w-6 h-6 text-primary" />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="rounded-xl border border-border bg-muted/20 p-3">
                                    <p className="text-xs text-muted-foreground">Available</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">{dashboardStats.officerAvailable}</p>
                                </div>
                                <div className="rounded-xl border border-border bg-muted/20 p-3">
                                    <p className="text-xs text-muted-foreground">Deployed</p>
                                    <p className="text-2xl font-bold text-orange-600 mt-1">{dashboardStats.officerBusy}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {officerAvailability.map((officer) => (
                                    <div key={officer.officer} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{officer.officer}</p>
                                            <p className="text-xs text-muted-foreground">Command duty roster</p>
                                        </div>
                                        <Badge className={officer.badge}>{officer.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                <div className={cn("grid gap-6", commandMode ? "xl:grid-cols-12" : "xl:grid-cols-12")}>
                    <Card className={cn("p-6 card-hover xl:col-span-4 min-h-[420px]", commandMode && "min-h-[520px]")}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Live Event Stream</h3>
                                <p className="text-sm text-muted-foreground mt-1">Realistic operational events every few seconds</p>
                            </div>
                            <TimerReset className="w-5 h-5 text-primary" />
                        </div>

                        <div className="space-y-3 max-h-[430px] overflow-auto pr-1">
                            {eventStream.map((event) => (
                                <div key={event.id} className="rounded-xl border border-border bg-muted/20 p-3">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{event.title}</p>
                                            <p className="text-xs text-muted-foreground">{event.module} · {event.district}</p>
                                        </div>
                                        <Badge className={severityStyles[event.severity]}>{event.severity}</Badge>
                                    </div>
                                    <p className="text-sm text-foreground leading-relaxed">{event.detail}</p>
                                    <p className="text-[11px] text-muted-foreground mt-2">{event.timestamp.toLocaleTimeString()}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 grid grid-cols-4 gap-2">
                            {Object.entries(eventSeverityStats).map(([severity, count]) => (
                                <div key={severity} className="rounded-xl border border-border bg-muted/20 p-3 text-center">
                                    <p className="text-xs text-muted-foreground capitalize">{severity}</p>
                                    <p className="text-xl font-bold text-foreground mt-1">{count}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className={cn("p-6 card-hover xl:col-span-5 min-h-[420px]", commandMode && "min-h-[520px]")}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Fraud Network Wall</h3>
                                <p className="text-sm text-muted-foreground mt-1">Animated graph of linked entities and cross-case relationships</p>
                            </div>
                            <Network className="w-5 h-5 text-primary" />
                        </div>

                        <div className="relative min-h-[370px] rounded-2xl border border-border bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">
                            <svg className="absolute inset-0 h-full w-full opacity-50" viewBox="0 0 1000 700">
                                {graphEdges.slice(0, 18).map((edge, index) => {
                                    const sourceIndex = graphNodes.findIndex((node) => node.id === edge.source);
                                    const targetIndex = graphNodes.findIndex((node) => node.id === edge.target);
                                    const sourceAngle = ((sourceIndex >= 0 ? sourceIndex : index) / Math.max(1, graphNodes.length)) * Math.PI * 2;
                                    const targetAngle = ((targetIndex >= 0 ? targetIndex : index + 2) / Math.max(1, graphNodes.length)) * Math.PI * 2;
                                    const sourceX = 500 + 220 * Math.cos(sourceAngle);
                                    const sourceY = 320 + 180 * Math.sin(sourceAngle);
                                    const targetX = 500 + 220 * Math.cos(targetAngle);
                                    const targetY = 320 + 180 * Math.sin(targetAngle);
                                    return (
                                        <line
                                            key={`${edge.source}-${edge.target}-${index}`}
                                            x1={sourceX}
                                            y1={sourceY}
                                            x2={targetX}
                                            y2={targetY}
                                            stroke={edge.weight > 5 ? "rgba(239,68,68,0.65)" : "rgba(59,130,246,0.55)"}
                                            strokeWidth={edge.weight > 5 ? 3 : 2}
                                            strokeDasharray="8 6"
                                            className="animate-pulse"
                                        />
                                    );
                                })}
                            </svg>

                            {mappedNodes.map((node, index) => {
                                const x = 500 + 220 * Math.cos(node.angle);
                                const y = 320 + 180 * Math.sin(node.angle);
                                const color = node.riskScore > 90 ? "bg-red-500" : node.riskScore > 75 ? "bg-orange-500" : "bg-blue-500";
                                return (
                                    <div
                                        key={node.id}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                        style={{ left: `${x}px`, top: `${y}px` }}
                                    >
                                        <div className={cn("rounded-full shadow-lg border-2 border-white text-white flex items-center justify-center", color, index === 0 ? "w-16 h-16" : "w-12 h-12")}>
                                            {node.type === "bank" ? <Building2 className="w-4 h-4" /> : node.type === "location" ? <MapPinned className="w-4 h-4" /> : node.type === "phone" ? <Globe className="w-4 h-4" /> : <Radar className="w-4 h-4" />}
                                        </div>
                                        <div className="mt-1 w-24 text-center text-[11px] text-foreground font-medium truncate">{node.label}</div>
                                    </div>
                                );
                            })}

                            <div className="absolute bottom-4 left-4 rounded-xl border border-border bg-white/90 backdrop-blur p-3">
                                <p className="text-xs text-muted-foreground">Network risk propagation</p>
                                <p className="text-xl font-bold text-foreground mt-1">{Math.min(99, stats.networkNodes * 7 + alerts.length * 3)}%</p>
                            </div>
                        </div>
                    </Card>

                    <Card className={cn("p-6 card-hover xl:col-span-3 min-h-[420px]", commandMode && "min-h-[520px]")}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Timeline Wall</h3>
                                <p className="text-sm text-muted-foreground mt-1">Every investigation progressing in real time</p>
                            </div>
                            <FileText className="w-5 h-5 text-primary" />
                        </div>

                        <div className="space-y-3 max-h-[370px] overflow-auto pr-1">
                            {combinedTimeline.map((event) => (
                                <div key={`${event.id}-${event.timestamp.getTime()}`} className="relative rounded-xl border border-border bg-muted/20 p-3">
                                    <div className="absolute left-3 top-4 h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    <div className="pl-6">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{event.type.replace(/_/g, " ")}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                                            </div>
                                            <Badge variant="outline" className="text-[11px]">{event.timestamp.toLocaleTimeString()}</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-12">
                    <Card className={cn("p-6 card-hover xl:col-span-4", commandMode && "min-h-[360px]")}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Investigation Queue</h3>
                                <p className="text-sm text-muted-foreground mt-1">Cases currently moving through AI stages</p>
                            </div>
                            <Server className="w-5 h-5 text-primary" />
                        </div>

                        <div className="space-y-3">
                            {liveInvestigationQueue.map((item) => (
                                <div key={item.id} className="rounded-xl border border-border bg-muted/20 p-3">
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{item.id}</p>
                                            <p className="text-xs text-muted-foreground">{item.title}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">{item.confidence}%</Badge>
                                    </div>
                                    <Progress value={item.progress} className="h-2" />
                                </div>
                            ))}
                            {liveInvestigationQueue.length === 0 && (
                                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                                    No cases currently in queue. Awaiting incoming incidents.
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className={cn("p-6 card-hover xl:col-span-4", commandMode && "min-h-[360px]")}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Evidence Upload Rate</h3>
                                <p className="text-sm text-muted-foreground mt-1">Average investigation time and throughput</p>
                            </div>
                            <Database className="w-5 h-5 text-primary" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="rounded-xl border border-border bg-muted/20 p-3">
                                <p className="text-xs text-muted-foreground">Evidence Upload Rate</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{dashboardStats.uploadsPerHour}/hr</p>
                            </div>
                            <div className="rounded-xl border border-border bg-muted/20 p-3">
                                <p className="text-xs text-muted-foreground">Average Investigation Time</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{dashboardStats.averageTime}m</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                    <span>Average AI Confidence</span>
                                    <span>{dashboardStats.averageConfidence}%</span>
                                </div>
                                <Progress value={dashboardStats.averageConfidence} className="h-2" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                    <span>Officer Availability</span>
                                    <span>{dashboardStats.officerAvailable} available</span>
                                </div>
                                <Progress value={Math.max(10, dashboardStats.officerAvailable * 12)} className="h-2" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                    <span>Requests Per Minute</span>
                                    <span>{telemetry.rpm}</span>
                                </div>
                                <Progress value={Math.min(100, telemetry.rpm / 2.5)} className="h-2" />
                            </div>
                        </div>
                    </Card>

                    <Card className={cn("p-6 card-hover xl:col-span-4", commandMode && "min-h-[360px]")}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Today's Statistics</h3>
                                <p className="text-sm text-muted-foreground mt-1">Current operational posture</p>
                            </div>
                            <Gauge className="w-5 h-5 text-primary" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-border bg-muted/20 p-3">
                                <p className="text-xs text-muted-foreground">Live Investigations</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{stats.totalCases}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-muted/20 p-3">
                                <p className="text-xs text-muted-foreground">Critical Alerts</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{alerts.filter((alert) => alert.severity === "critical").length}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-muted/20 p-3">
                                <p className="text-xs text-muted-foreground">District Hotspots</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{stats.hotspots}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-muted/20 p-3">
                                <p className="text-xs text-muted-foreground">AI Confidence</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{dashboardStats.averageConfidence}%</p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
                            <p className="text-xs text-muted-foreground mb-2">National Command Prediction</p>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-lg font-semibold text-foreground">Risk is projected to rise in two districts.</p>
                                    <p className="text-sm text-muted-foreground mt-1">Current pattern suggests escalation within the next operational window.</p>
                                </div>
                                <ArrowUpRight className="w-6 h-6 text-red-500" />
                            </div>
                        </div>
                    </Card>
                </div>

                <Sheet open={notificationOpen} onOpenChange={setNotificationOpen}>
                    <SheetContent side="right" className="w-[420px] sm:max-w-[420px] overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Notification Center</SheetTitle>
                        </SheetHeader>

                        <div className="mt-6 space-y-3">
                            {notificationsByPriority.slice(0, 16).map((item) => (
                                <div key={item.id} className="rounded-xl border border-border bg-muted/20 p-3">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                        </div>
                                        <Badge className={severityStyles[item.severity]}>{item.severity}</Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">{item.timestamp.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </SatarkLayout>
    );
}