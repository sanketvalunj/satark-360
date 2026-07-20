import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AIAnalysisSession } from "@/engine/types";

interface AIPipelinePanelProps {
    session?: AIAnalysisSession;
    title?: string;
    compact?: boolean;
}

const statusStyles = {
    queued: "bg-slate-100 text-slate-700",
    running: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
} as const;

const agentStatusStyles = {
    waiting: "bg-slate-100 text-slate-700",
    running: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
} as const;

export function AIPipelinePanel({ session, title = "AI Orchestrator", compact = false }: AIPipelinePanelProps) {
    if (!session) {
        return (
            <Card className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 w-36 rounded bg-muted" />
                    <div className="h-8 w-full rounded bg-muted" />
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-16 rounded bg-muted" />
                        <div className="h-16 rounded bg-muted" />
                    </div>
                    <div className="h-24 rounded bg-muted" />
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 card-hover">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <h3 className="text-lg font-bold text-foreground">{title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        Investigation {session.investigationId}
                    </p>
                </div>
                <Badge className={statusStyles[session.status]}>{session.status}</Badge>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>Current Stage</span>
                        <span>{session.currentStageLabel}</span>
                    </div>
                    <Progress value={session.liveProgress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Completed Agents</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{session.completedAgents}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Running Agents</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{session.runningAgents}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Confidence</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{session.confidenceScore}%</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">ETA</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{session.estimatedTimeSeconds}s</p>
                    </div>
                </div>

                {!compact && (
                    <>
                        <div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span>Queue</span>
                                <span>{session.queue.length} remaining stages</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {session.queue.slice(0, 4).map((stage) => (
                                    <Badge key={stage} variant="outline" className="text-xs">
                                        {stage.replace(/_/g, " ")}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {session.agents.slice(0, 4).map((agent) => (
                                <div key={agent.id} className="rounded-lg border border-border bg-background/80 p-3">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <p className="text-sm font-medium text-foreground">{agent.name}</p>
                                        <Badge className={agentStatusStyles[agent.status]}>{agent.status}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{agent.outputSummary}</p>
                                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                        <span>Confidence {agent.confidence}%</span>
                                        <span>{agent.executionTimeMs}ms</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!compact && (
                    <>
                        <div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span>Queue</span>
                                <span>{session.queue.length} remaining stages</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {session.queue.map((stage) => (
                                    <Badge key={stage} variant="outline" className="text-xs">
                                        {stage.replace(/_/g, " ")}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span>Agents</span>
                                <span>{session.agents.filter((agent) => agent.status === "completed").length}/10 completed</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {session.agents.map((agent) => (
                                    <div key={agent.id} className="rounded-lg border border-border bg-background/80 p-3">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className="text-sm font-medium text-foreground">{agent.name}</p>
                                            <Badge className={agentStatusStyles[agent.status]}>{agent.status}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{agent.outputSummary}</p>
                                        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                            <span>Confidence {agent.confidence}%</span>
                                            <span>{agent.executionTimeMs}ms</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span>Explainable AI</span>
                                <span>{session.explainableAI.confidenceScore}% confidence</span>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Reason</p>
                                    <p className="text-sm text-foreground mt-1 leading-relaxed">{session.explainableAI.reason}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Evidence Used</p>
                                    <p className="text-sm text-foreground mt-1">{session.explainableAI.evidenceUsed.join(", ")}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Recommended Action</p>
                                    <p className="text-sm text-foreground mt-1 leading-relaxed">{session.explainableAI.recommendedAction}</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
}
