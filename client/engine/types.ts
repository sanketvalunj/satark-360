export type EntityType =
    | "citizen"
    | "complaint"
    | "phone"
    | "upi"
    | "bank"
    | "location"
    | "device";

export interface Investigation {
    id: string;
    type:
    | "digital_arrest"
    | "counterfeit"
    | "banking_fraud"
    | "fraud_network"
    | "other";
    title: string;
    status: "new" | "active" | "review" | "investigation" | "closed";
    riskLevel: "low" | "medium" | "high" | "critical";
    riskScore: number;
    createdAt: Date;
    updatedAt: Date;
    citizenName?: string;
    phoneNumber?: string;
    upiId?: string;
    description: string;
    source: "citizen" | "digital_arrest" | "counterfeit" | "manual";
    location?: Location;
    evidenceIds: string[];
    alertIds: string[];
    relatedEntityIds: string[];
    relatedCases?: string[];
    timeline: TimelineEvent[];
    summary: string;
    assignedOfficer?: string;
    riskHistory?: RiskAssessment[];
    aiOutputs?: AIOutput[];
    officerNotes?: string[];
    reportIds?: string[];
}

export interface Evidence {
    id: string;
    caseId: string;
    type: "image" | "audio" | "video" | "pdf" | "qr" | "text";
    name: string;
    uploadedAt: Date;
    size: number;
    metadata?: Record<string, unknown>;
}

export interface Alert {
    id: string;
    title: string;
    description: string;
    timestamp: Date;
    severity: "low" | "medium" | "high" | "critical";
    caseId?: string;
    resolved: boolean;
    source: "citizen" | "digital_arrest" | "counterfeit" | "engine";
}

export interface Person {
    id: string;
    name: string;
    riskScore: number;
    investigationIds: string[];
    metadata?: Record<string, unknown>;
}

export interface Phone {
    id: string;
    number: string;
    riskScore: number;
    investigationIds: string[];
    entityIds: string[];
}

export interface UPI {
    id: string;
    handle: string;
    riskScore: number;
    investigationIds: string[];
    entityIds: string[];
}

export interface Bank {
    id: string;
    name: string;
    riskScore: number;
    investigationIds: string[];
    entityIds: string[];
}

export interface Location {
    city: string;
    state: string;
    lat: number;
    lng: number;
    risk: "low" | "medium" | "high" | "critical";
    caseCount: number;
    investigationIds: string[];
}

export interface RiskAssessment {
    investigationId: string;
    score: number;
    level: "low" | "medium" | "high" | "critical";
    factors: string[];
    updatedAt: Date;
}

export type AIStageKey =
    | "evidence_collection"
    | "evidence_validation"
    | "ai_orchestration"
    | "parallel_agents"
    | "risk_fusion"
    | "cross_intelligence_correlation"
    | "explainable_ai"
    | "investigation_ready"
    | "court_ready_report";

export type AIAgentStatus = "waiting" | "running" | "completed";

export interface AIAgentState {
    id: string;
    name: string;
    status: AIAgentStatus;
    confidence: number;
    executionTimeMs: number;
    outputSummary: string;
}

export interface ExplainableAIResult {
    confidenceScore: number;
    reason: string;
    evidenceUsed: string[];
    matchedPattern: string;
    historicalSimilarCases: string[];
    governmentAdvisoryUsed: string;
    recommendedAction: string;
}

export interface AIOutput {
    stage: AIStageKey;
    title: string;
    summary: string;
    confidence: number;
    createdAt: Date;
}

export interface AnalysisStageState {
    stage: AIStageKey;
    label: string;
    status: "pending" | "running" | "completed";
    progress: number;
}

export interface AnalysisReportSection {
    title: string;
    status: "pending" | "running" | "completed";
    summary: string;
}

export interface AIAnalysisSession {
    id: string;
    investigationId: string;
    status: "queued" | "running" | "completed";
    currentStage: AIStageKey;
    currentStageLabel: string;
    stages: AnalysisStageState[];
    agents: AIAgentState[];
    completedAgents: number;
    runningAgents: number;
    queue: AIStageKey[];
    estimatedTimeSeconds: number;
    liveProgress: number;
    confidenceScore: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    stageLog: TimelineEvent[];
    explainableAI: ExplainableAIResult;
    outputs: AIOutput[];
    reportSections: AnalysisReportSection[];
    evidenceNames: string[];
    relatedCaseIds: string[];
}

export interface TimelineEvent {
    id: string;
    timestamp: Date;
    type: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
}

export interface GraphNode {
    id: string;
    label: string;
    type: EntityType;
    riskScore: number;
    connections: number;
    investigationIds: string[];
    metadata?: Record<string, unknown>;
}

export interface GraphEdge {
    source: string;
    target: string;
    type: string;
    weight: number;
    label?: string;
    investigationId?: string;
}

export interface NotificationItem {
    id: string;
    title: string;
    description: string;
    timestamp: Date;
    read: boolean;
    severity: "low" | "medium" | "high" | "critical";
    caseId?: string;
    action?: string;
}

export interface ReportRecord {
    id: string;
    investigationId: string;
    title: string;
    generatedAt: Date;
    content: string;
}

export interface KnowledgeEntry {
    id: string;
    title: string;
    category: string;
    content: string;
    tags: string[];
}

export interface DashboardSnapshot {
    totalCases: number;
    activeCases: number;
    highRiskAlerts: number;
    fraudsPrevented: number;
    networkNodes: number;
    digitalArrestCases: number;
    counterfeitCases: number;
    hotspots: number;
}
