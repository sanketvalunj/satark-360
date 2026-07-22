import type {
    Alert,
    Bank,
    AIAnalysisSession,
    AIOutput,
    AIStageKey,
    AIAgentState,
    AnalysisReportSection,
    AnalysisStageState,
    DashboardSnapshot,
    Evidence,
    GraphEdge,
    GraphNode,
    Investigation,
    KnowledgeEntry,
    Location,
    NotificationItem,
    Person,
    Phone,
    ReportRecord,
    RiskAssessment,
    TimelineEvent,
    ExplainableAIResult,
    UPI,
} from "./types";
import {
    initialAlerts,
    initialBanks,
    initialGraphEdges,
    initialGraphNodes,
    initialInvestigations,
    initialKnowledgeBase,
    initialLocations,
    initialPeople,
    initialPhones,
    initialReports,
    initialRiskAssessments,
    initialUpis,
} from "./defaults";

export interface PlatformState {
    investigations: Investigation[];
    evidence: Evidence[];
    alerts: Alert[];
    people: Person[];
    phones: Phone[];
    upis: UPI[];
    banks: Bank[];
    locations: Location[];
    riskAssessments: RiskAssessment[];
    timeline: TimelineEvent[];
    graphNodes: GraphNode[];
    graphEdges: GraphEdge[];
    notifications: NotificationItem[];
    reports: ReportRecord[];
    knowledgeBase: KnowledgeEntry[];
    analysisSessions: AIAnalysisSession[];
    selectedInvestigationType: string | null;
}

export const createInitialPlatformState = (): PlatformState => ({
    investigations: initialInvestigations,
    evidence: [
        {
            id: "EV-1001",
            caseId: "INV-2024-0001",
            type: "audio",
            name: "Call_Recording_INV2024001.wav",
            uploadedAt: new Date(Date.now() - 10 * 60 * 1000),
            size: 2147483,
            metadata: {
                source: "digital_arrest",
                status: "Processed",
                hash: "b2f0d8627f8d",
                preview: "Call recording of impersonation and urgent bank transfer demand.",
                aiSummary: "Identified high-risk government impersonation with urgency cues.",
                extractedEntities: {
                    "Phone Numbers": ["+91-9876543210", "+91-9123456789"],
                    "Names": ["Rajesh Kumar", "Police Commissioner"],
                    "UPI IDs": ["victim.upi@bank"],
                    "Government IDs": ["Aadhaar 1234-5678-9012"],
                },
                chainOfCustody: [
                    { timestamp: new Date(Date.now() - 10 * 60 * 1000), officer: "Inspector Sharma", action: "Evidence Uploaded" },
                    { timestamp: new Date(Date.now() - 9 * 60 * 1000), officer: "Inspector Sharma", action: "AI Processed" },
                ],
                verified: true,
                category: "audio",
            },
        },
        {
            id: "EV-1002",
            caseId: "INV-2024-0001",
            type: "text",
            name: "Digital_Arrest_Transcript.txt",
            uploadedAt: new Date(Date.now() - 9 * 60 * 1000),
            size: 65234,
            metadata: {
                source: "digital_arrest",
                category: "transcript",
                status: "Verified",
                hash: "3a9d4f5c8b1e",
                preview: "Transcript of extortion call asking for immediate transfer.",
                ocrText: "Caller: 'You must transfer ₹50,000 immediately to avoid arrest'",
                aiSummary: "Transcript confirms urgency and financial fraud indicators.",
                extractedEntities: {
                    "Phone Numbers": ["+91-9876543210"],
                    "UPI IDs": ["victim.upi@bank"],
                    "Names": ["Rajesh Kumar"],
                },
                chainOfCustody: [
                    { timestamp: new Date(Date.now() - 9 * 60 * 1000), officer: "Inspector Sharma", action: "Evidence Uploaded" },
                    { timestamp: new Date(Date.now() - 8 * 60 * 1000), officer: "Inspector Sharma", action: "OCR Completed" },
                ],
                verified: true,
            },
        },
        {
            id: "EV-1003",
            caseId: "INV-2024-0001",
            type: "image",
            name: "WhatsApp_Scam_Screenshot.png",
            uploadedAt: new Date(Date.now() - 8 * 60 * 1000),
            size: 842193,
            metadata: {
                source: "digital_arrest",
                status: "Reviewed",
                hash: "d7c2b4a5f8e9",
                preview: "Screenshot of WhatsApp message claiming police action.",
                aiSummary: "Image shows scam message with government impersonation and transaction request.",
                extractedEntities: {
                    "Phone Numbers": ["+91-9876501234"],
                    "UPI IDs": ["police.upi@bank"],
                    "Emails": ["support@police.gov.in"],
                    "URLs": ["http://police-secure.in"],
                },
                chainOfCustody: [
                    { timestamp: new Date(Date.now() - 8 * 60 * 1000), officer: "Inspector Sharma", action: "Evidence Uploaded" },
                    { timestamp: new Date(Date.now() - 7 * 60 * 1000), officer: "Inspector Sharma", action: "AI Processed" },
                ],
                verified: true,
                bookmarked: true,
                category: "ocr",
            },
        },
        {
            id: "EV-2001",
            caseId: "INV-2024-0002",
            type: "pdf",
            name: "Currency_Image_Analysis.pdf",
            uploadedAt: new Date(Date.now() - 20 * 60 * 1000),
            size: 524288,
            metadata: {
                source: "counterfeit",
                status: "Reviewed",
                hash: "5f8a3b2d7e4c",
                preview: "PDF report showing counterfeit note analysis and fingerprint match.",
                aiSummary: "Document identifies watermark mismatch and serial inconsistency.",
                extractedEntities: {
                    "Bank Accounts": ["ICICI 1234567890"],
                    "Names": ["Unknown suspect"],
                },
                chainOfCustody: [
                    { timestamp: new Date(Date.now() - 20 * 60 * 1000), officer: "Inspector Verma", action: "Evidence Uploaded" },
                    { timestamp: new Date(Date.now() - 19 * 60 * 1000), officer: "Inspector Verma", action: "AI Processed" },
                ],
                verified: true,
                category: "pdf",
            },
        },
        {
            id: "EV-2002",
            caseId: "INV-2024-0002",
            type: "image",
            name: "Counterfeit_Note_Photo.jpg",
            uploadedAt: new Date(Date.now() - 19 * 60 * 1000),
            size: 1124978,
            metadata: {
                source: "counterfeit",
                status: "Processed",
                hash: "eefc7b9d3c4a",
                preview: "High-resolution note image for forensic analysis.",
                aiSummary: "Visual scan detected security thread irregularities.",
                extractedEntities: {
                    "Bank Accounts": ["RBI Template"],
                },
                chainOfCustody: [
                    { timestamp: new Date(Date.now() - 19 * 60 * 1000), officer: "Inspector Verma", action: "Evidence Uploaded" },
                ],
                verified: false,
                category: "ocr",
            },
        },
        {
            id: "EV-3001",
            caseId: "INV-2024-0003",
            type: "pdf",
            name: "UPI_Receipt.pdf",
            uploadedAt: new Date(Date.now() - 30 * 60 * 1000),
            size: 762348,
            metadata: {
                source: "banking_fraud",
                status: "Verified",
                hash: "c9d8f2a1b4e5",
                preview: "Payment receipt showing transfer to suspicious account.",
                aiSummary: "Receipt confirms transfer to unknown recipient linked to fraud network.",
                extractedEntities: {
                    "UPI IDs": ["scammer.upi@bank"],
                    "Bank Accounts": ["ICICI 1234567890"],
                },
                chainOfCustody: [
                    { timestamp: new Date(Date.now() - 30 * 60 * 1000), officer: "Inspector Mehta", action: "Evidence Uploaded" },
                    { timestamp: new Date(Date.now() - 29 * 60 * 1000), officer: "Inspector Mehta", action: "OCR Completed" },
                ],
                verified: true,
                category: "pdf",
            },
        },
        {
            id: "EV-3002",
            caseId: "INV-2024-0003",
            type: "text",
            name: "Transfer_Transcript.txt",
            uploadedAt: new Date(Date.now() - 29 * 60 * 1000),
            size: 45321,
            metadata: {
                source: "banking_fraud",
                category: "transcript",
                status: "Processed",
                hash: "a7b4c2d9e8f1",
                preview: "Call transcript related to the fraudulent UPI transfer.",
                ocrText: "Requester: 'Send the amount to take immediate action on your account.'",
                aiSummary: "Transcript indicates payment pressure and account takeover risk.",
                extractedEntities: {
                    "Phone Numbers": ["+91-9988776655"],
                    "UPI IDs": ["scammer.upi@bank"],
                },
                chainOfCustody: [
                    { timestamp: new Date(Date.now() - 29 * 60 * 1000), officer: "Inspector Mehta", action: "Evidence Uploaded" },
                ],
                verified: true,
            },
        },
        {
            id: "EV-4001",
            caseId: "INV-2024-0004",
            type: "image",
            name: "Fake_Police_ID.png",
            uploadedAt: new Date(Date.now() - 40 * 60 * 1000),
            size: 985432,
            metadata: {
                source: "fraud_network",
                status: "Reviewed",
                hash: "c3d9a7b1e8f6",
                preview: "Scanned police ID used in multiple scam cases.",
                aiSummary: "Image matches known fraudulent identity patterns.",
                extractedEntities: {
                    "Names": ["Akhil Sharma"],
                    "Government IDs": ["Fake ID 2345"],
                },
                chainOfCustody: [
                    { timestamp: new Date(Date.now() - 40 * 60 * 1000), officer: "Inspector Khan", action: "Evidence Uploaded" },
                ],
                verified: true,
                bookmarked: true,
                category: "ocr",
            },
        },
        {
            id: "EV-4002",
            caseId: "INV-2024-0004",
            type: "video",
            name: "Location_Screenshot.mp4",
            uploadedAt: new Date(Date.now() - 42 * 60 * 1000),
            size: 5842934,
            metadata: {
                source: "fraud_network",
                status: "Processed",
                hash: "f1a2b3c4d5e6",
                preview: "Video clip showing location reference used in the fraud network.",
                aiSummary: "Visual evidence ties geographic hotspot to the network footprint.",
                extractedEntities: {
                    "Addresses": ["Sector 52, Kolkata"],
                },
                chainOfCustody: [
                    { timestamp: new Date(Date.now() - 42 * 60 * 1000), officer: "Inspector Khan", action: "Evidence Uploaded" },
                ],
                verified: true,
                category: "video",
            },
        },
    ],
    alerts: initialAlerts,
    people: initialPeople,
    phones: initialPhones,
    upis: initialUpis,
    banks: initialBanks,
    locations: initialLocations,
    riskAssessments: initialRiskAssessments,
    timeline: initialInvestigations.flatMap((investigation) => investigation.timeline),
    graphNodes: initialGraphNodes,
    graphEdges: initialGraphEdges,
    notifications: initialAlerts.map((alert) => ({
        id: `NT-${alert.id}`,
        title: alert.title,
        description: alert.description,
        timestamp: alert.timestamp,
        read: false,
        severity: alert.severity,
        caseId: alert.caseId,
        action: "Open alert",
    })),
    reports: initialReports,
    knowledgeBase: initialKnowledgeBase,
    analysisSessions: [],
    selectedInvestigationType: null,
});

export type CreateComplaintInput = {
    citizenName: string;
    description: string;
    phoneNumber?: string;
    upiId?: string;
    location?: string;
    evidence?: Omit<Evidence, "id" | "caseId" | "uploadedAt">[];
    source: "citizen" | "digital_arrest" | "counterfeit";
    title: string;
    type: Investigation["type"];
};

export type DigitalArrestInput = {
    callerId: string;
    recipientName: string;
    transcript: string;
    keywords: string[];
};

export type CounterfeitInput = {
    denomination: string;
    noteSummary: string;
    evidenceName: string;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const nextId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const AI_STAGES: Array<{ key: AIStageKey; label: string; duration: number }> = [
    { key: "evidence_collection", label: "Evidence Collection", duration: 650 },
    { key: "evidence_validation", label: "Evidence Validation", duration: 650 },
    { key: "ai_orchestration", label: "AI Orchestration", duration: 500 },
    { key: "parallel_agents", label: "Parallel AI Agents", duration: 900 },
    { key: "risk_fusion", label: "Risk Fusion", duration: 550 },
    { key: "cross_intelligence_correlation", label: "Cross Intelligence Correlation", duration: 650 },
    { key: "explainable_ai", label: "Explainable AI", duration: 500 },
    { key: "investigation_ready", label: "Investigation Ready", duration: 450 },
    { key: "court_ready_report", label: "Court Ready Report", duration: 700 },
];

const AI_AGENT_BLUEPRINTS = [
    { id: "speech", name: "Speech Intelligence Agent" },
    { id: "vision", name: "Vision Intelligence Agent" },
    { id: "ocr", name: "OCR Intelligence Agent" },
    { id: "behaviour", name: "Behaviour Analysis Agent" },
    { id: "caller", name: "Caller Intelligence Agent" },
    { id: "graph", name: "Graph Intelligence Agent" },
    { id: "geo", name: "Geo Intelligence Agent" },
    { id: "knowledge", name: "Knowledge Retrieval Agent" },
    { id: "counterfeit", name: "Counterfeit Detection Agent" },
    { id: "entity", name: "Entity Resolution Agent" },
] as const;

const advisoryByType: Record<string, string> = {
    digital_arrest: "MHA and CERT-In guidance for government impersonation and urgent payment scams.",
    counterfeit: "RBI counterfeit circulation advisory and forensic note verification checklist.",
    banking_fraud: "RBI digital payments safety advisory and UPI fraud reporting guidance.",
    fraud_network: "Inter-agency cybercrime correlation advisory and entity-linking protocol.",
    other: "General cyber fraud investigation advisory.",
};

const similarCaseLabel = (investigation: Investigation) => `${investigation.id} - ${investigation.title}`;

const deriveRisk = (text: string) => {
    const lower = text.toLowerCase();
    let score = 40;
    const factors: string[] = [];

    if (/(arrest|police|commissioner|court|jail)/.test(lower)) {
        score += 30;
        factors.push("government impersonation");
    }
    if (/(urgent|immediately|today|now|transfer)/.test(lower)) {
        score += 18;
        factors.push("urgency pressure");
    }
    if (/(upi|bank|account|wallet|payment)/.test(lower)) {
        score += 16;
        factors.push("financial account exposure");
    }
    if (/(note|currency|watermark|serial|fake)/.test(lower)) {
        score += 24;
        factors.push("counterfeit indicators");
    }

    score = Math.max(10, Math.min(99, score));
    const level: RiskAssessment["level"] = score > 85 ? "critical" : score > 65 ? "high" : score > 40 ? "medium" : "low";

    return { score, level, factors };
};

export class PlatformEngine {
    private state: PlatformState;
    private listeners = new Set<() => void>();
    private version = 0;

    constructor(seed: PlatformState = createInitialPlatformState()) {
        this.state = seed;
    }

    subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify() {
        this.version += 1;
        this.listeners.forEach((listener) => listener());
    }

    getVersion() {
        return this.version;
    }

    getState() {
        return this.state;
    }

    getInvestigation(id: string) {
        return this.state.investigations.find((investigation) => investigation.id === id);
    }

    getEvidenceByCase(caseId: string) {
        return this.state.evidence.filter((item) => item.caseId === caseId);
    }

    addEvidence(caseId: string, evidence: Omit<Evidence, "id" | "caseId" | "uploadedAt">) {
        const newEvidence: Evidence = {
            ...evidence,
            id: nextId("EV"),
            caseId,
            uploadedAt: new Date(),
        };

        this.state.evidence = [newEvidence, ...this.state.evidence];
        this.state.investigations = this.state.investigations.map((investigation) =>
            investigation.id === caseId
                ? {
                    ...investigation,
                    evidenceIds: [...investigation.evidenceIds, newEvidence.id],
                    timeline: [
                        {
                            id: nextId("TL"),
                            timestamp: new Date(),
                            type: "evidence_linked",
                            description: `Evidence ${newEvidence.name} linked to case.`,
                            severity: "medium",
                        },
                        ...investigation.timeline,
                    ],
                    updatedAt: new Date(),
                }
                : investigation
        );

        const session = this.getAnalysisSession(caseId);
        if (session) {
            this.updateAnalysisSession(session.id, (currentSession) => {
                currentSession.evidenceNames = Array.from(new Set([...currentSession.evidenceNames, newEvidence.name]));
                currentSession.outputs = [
                    ...currentSession.outputs,
                    {
                        stage: "evidence_collection",
                        title: "Evidence Uploaded",
                        summary: `${newEvidence.name} was linked and queued for validation.`,
                        confidence: currentSession.confidenceScore,
                        createdAt: new Date(),
                    },
                ];
            });
        }

        this.notify();
        return newEvidence;
    }

    addAlert(alert: Omit<Alert, "id" | "timestamp" | "resolved">) {
        const newAlert: Alert = {
            ...alert,
            id: nextId("ALERT"),
            timestamp: new Date(),
            resolved: false,
        };

        this.state.alerts = [newAlert, ...this.state.alerts].slice(0, 50);
        this.state.notifications = [
            {
                id: nextId("NT"),
                title: newAlert.title,
                description: newAlert.description,
                timestamp: newAlert.timestamp,
                read: false,
                severity: newAlert.severity,
                caseId: newAlert.caseId,
                action: "Open investigation",
            },
            ...this.state.notifications,
        ].slice(0, 50);
        this.notify();
        return newAlert;
    }

    resolveAlert(id: string) {
        this.state.alerts = this.state.alerts.map((alert) =>
            alert.id === id ? { ...alert, resolved: true } : alert
        );
        this.notify();
    }

    addGraphNode(node: Omit<GraphNode, "id">) {
        const newNode: GraphNode = {
            ...node,
            id: nextId("NODE"),
        };
        this.state.graphNodes = [newNode, ...this.state.graphNodes];
        this.notify();
        return newNode;
    }

    addGraphEdge(edge: GraphEdge) {
        this.state.graphEdges = [...this.state.graphEdges, edge];
        this.notify();
        return edge;
    }

    updateLocation(city: string, location: Partial<Location>) {
        this.state.locations = this.state.locations.map((item) =>
            item.city === city ? { ...item, ...location } : item
        );
        this.notify();
    }

    deleteInvestigation(id: string) {
        this.state.investigations = this.state.investigations.filter((item) => item.id !== id);
        this.state.evidence = this.state.evidence.filter((item) => item.caseId !== id);
        this.state.alerts = this.state.alerts.filter((item) => item.caseId !== id);
        this.notify();
    }

    getSnapshot(): DashboardSnapshot {
        return {
            totalCases: this.state.investigations.length,
            activeCases: this.state.investigations.filter((investigation) => investigation.status === "active").length,
            highRiskAlerts: this.state.alerts.filter((alert) => !alert.resolved).length,
            fraudsPrevented: Math.floor(this.state.investigations.length * 1.8),
            networkNodes: this.state.graphNodes.length,
            digitalArrestCases: this.state.investigations.filter((investigation) => investigation.type === "digital_arrest").length,
            counterfeitCases: this.state.investigations.filter((investigation) => investigation.type === "counterfeit").length,
            hotspots: this.state.locations.filter((location) => location.risk === "critical" || location.risk === "high").length,
        };
    }

    getRecentEvidence() {
        return [...this.state.evidence].sort((left, right) => right.uploadedAt.getTime() - left.uploadedAt.getTime());
    }

    getKnowledgeEntries(query = "") {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return this.state.knowledgeBase;

        return this.state.knowledgeBase.filter((entry) =>
            [entry.title, entry.category, entry.content, ...entry.tags].some((value) => value.toLowerCase().includes(normalized))
        );
    }

    getAnalysisSession(investigationId: string) {
        return this.state.analysisSessions.find((session) => session.investigationId === investigationId);
    }

    getActiveAnalysisSessions() {
        return this.state.analysisSessions.filter((session) => session.status !== "completed");
    }

    private updateAnalysisSession(sessionId: string, updater: (session: AIAnalysisSession) => void) {
        const session = this.state.analysisSessions.find((item) => item.id === sessionId);
        if (!session) {
            return undefined;
        }

        updater(session);
        session.updatedAt = new Date();
        this.notify();
        return session;
    }

    private buildExplainableResult(investigation: Investigation, evidenceNames: string[], confidenceScore: number): ExplainableAIResult {
        const advisory = advisoryByType[investigation.type] ?? advisoryByType.other;
        const similarCases = this.state.investigations
            .filter((item) => item.type === investigation.type && item.id !== investigation.id)
            .slice(0, 3)
            .map(similarCaseLabel);

        return {
            confidenceScore,
            reason: `${investigation.type.replace(/_/g, " ")} indicators matched the current evidence package and fraud pattern library.`,
            evidenceUsed: evidenceNames.length > 0 ? evidenceNames : ["Complaint transcript", "Investigation metadata"],
            matchedPattern: `${investigation.type.replace(/_/g, " ")} pattern`,
            historicalSimilarCases: similarCases.length > 0 ? similarCases : ["No prior match in local store"],
            governmentAdvisoryUsed: advisory,
            recommendedAction: investigation.type === "counterfeit"
                ? "Send to currency forensics and notify the nearest police unit."
                : investigation.type === "digital_arrest"
                    ? "Preserve transcripts, freeze the number chain, and escalate to cybercrime officers."
                    : "Continue correlation and complete the cross-intelligence review.",
        };
    }

    private createAnalysisSession(investigation: Investigation, evidenceNames: string[]) {
        const session: AIAnalysisSession = {
            id: nextId("AIS"),
            investigationId: investigation.id,
            status: "running",
            currentStage: AI_STAGES[0].key,
            currentStageLabel: AI_STAGES[0].label,
            stages: AI_STAGES.map((stage, index) => ({
                stage: stage.key,
                label: stage.label,
                status: index === 0 ? "running" : "pending",
                progress: index === 0 ? 20 : 0,
            })),
            agents: AI_AGENT_BLUEPRINTS.map((agent) => ({
                id: agent.id,
                name: agent.name,
                status: "waiting",
                confidence: 0,
                executionTimeMs: 0,
                outputSummary: "Waiting for orchestration",
            })),
            completedAgents: 0,
            runningAgents: 0,
            queue: AI_STAGES.slice(1).map((stage) => stage.key),
            estimatedTimeSeconds: 24,
            liveProgress: 8,
            confidenceScore: Math.max(48, Math.min(72, Math.round(investigation.riskScore * 0.62))),
            createdAt: new Date(),
            updatedAt: new Date(),
            stageLog: [
                {
                    id: nextId("TL"),
                    timestamp: new Date(),
                    type: "analysis_queued",
                    description: "AI investigation pipeline queued.",
                    severity: "medium",
                },
            ],
            explainableAI: this.buildExplainableResult(investigation, evidenceNames, Math.max(48, Math.min(72, Math.round(investigation.riskScore * 0.62)))),
            outputs: [],
            reportSections: [
                { title: "Executive Summary", status: "pending", summary: "Awaiting fused investigation summary." },
                { title: "Timeline", status: "pending", summary: "Timeline will populate as stages complete." },
                { title: "Evidence", status: "pending", summary: "Evidence package is being normalized." },
                { title: "Graph", status: "pending", summary: "Graph intelligence will expand during correlation." },
                { title: "Geo", status: "pending", summary: "Hotspot analysis will update during geo correlation." },
                { title: "Risk", status: "pending", summary: "Risk fusion will finalize this section." },
                { title: "Recommendations", status: "pending", summary: "Recommended actions will appear after explainable AI." },
            ],
            evidenceNames,
            relatedCaseIds: [],
        };

        this.state.analysisSessions = [session, ...this.state.analysisSessions.filter((item) => item.investigationId !== investigation.id)];
        return session;
    }

    private recordAnalysisOutput(investigationId: string, output: AIOutput) {
        this.state.investigations = this.state.investigations.map((investigation) =>
            investigation.id === investigationId
                ? {
                    ...investigation,
                    aiOutputs: [output, ...(investigation.aiOutputs || [])],
                    updatedAt: new Date(),
                }
                : investigation
        );
        this.notify();
    }

    private recordRiskHistory(investigationId: string, riskHistory: RiskAssessment) {
        this.state.investigations = this.state.investigations.map((investigation) =>
            investigation.id === investigationId
                ? {
                    ...investigation,
                    riskHistory: [riskHistory, ...(investigation.riskHistory || [])],
                    updatedAt: new Date(),
                }
                : investigation
        );
        this.notify();
    }

    private markReportSection(sessionId: string, title: string, status: AnalysisReportSection["status"], summary: string) {
        this.updateAnalysisSession(sessionId, (session) => {
            session.reportSections = session.reportSections.map((section) =>
                section.title === title ? { ...section, status, summary } : section
            );
        });
    }

    private syncSessionFromInvestigation(sessionId: string, investigationId: string, updater: (session: AIAnalysisSession) => void) {
        this.updateAnalysisSession(sessionId, updater);
        this.updateInvestigation(investigationId, {});
    }

    private async runParallelAgents(sessionId: string, investigation: Investigation) {
        const agentTasks = AI_AGENT_BLUEPRINTS.map(async (agentBlueprint, index) => {
            const start = Date.now();

            this.updateAnalysisSession(sessionId, (session) => {
                const agent = session.agents.find((item) => item.id === agentBlueprint.id);
                if (agent) {
                    agent.status = "running";
                    agent.outputSummary = "Processing evidence and context";
                    agent.confidence = Math.max(agent.confidence, 58 + index * 3);
                    session.runningAgents = session.agents.filter((item) => item.status === "running").length;
                }
            });

            await wait(220 + index * 80);

            const outputSummary = this.getAgentOutput(agentBlueprint.id, investigation);
            const confidence = Math.min(99, 63 + index * 3 + Math.floor(investigation.riskScore / 10));

            this.updateAnalysisSession(sessionId, (session) => {
                const agent = session.agents.find((item) => item.id === agentBlueprint.id);
                if (agent) {
                    agent.status = "completed";
                    agent.outputSummary = outputSummary;
                    agent.confidence = confidence;
                    agent.executionTimeMs = Date.now() - start;
                    session.completedAgents = session.agents.filter((item) => item.status === "completed").length;
                    session.runningAgents = session.agents.filter((item) => item.status === "running").length;
                }
            });

            const output: AIOutput = {
                stage: "parallel_agents",
                title: agentBlueprint.name,
                summary: outputSummary,
                confidence,
                createdAt: new Date(),
            };

            this.recordAnalysisOutput(investigation.id, output);
            this.recordRiskHistory(investigation.id, {
                investigationId: investigation.id,
                score: confidence,
                level: confidence > 85 ? "critical" : confidence > 65 ? "high" : "medium",
                factors: [agentBlueprint.name, "agent collaboration"],
                updatedAt: new Date(),
            });
        });

        await Promise.all(agentTasks);
    }

    private getAgentOutput(agentId: string, investigation: Investigation) {
        switch (agentId) {
            case "speech":
                return investigation.type === "digital_arrest" ? "Transcribed coercive call language and urgency cues." : "No speech evidence required.";
            case "vision":
                return investigation.type === "counterfeit" ? "Detected note image anomalies and low-level visual inconsistency." : "No visual analysis required.";
            case "ocr":
                return "Extracted serials, names, and structured text from submitted evidence.";
            case "behaviour":
                return "Mapped scam urgency patterns, pressure loops, and escalation language.";
            case "caller":
                return "Resolved caller identity chain and phone origin patterns.";
            case "graph":
                return "Built relationship graph and propagated network risk across linked entities.";
            case "geo":
                return "Correlated hotspot geography with the active complaint footprint.";
            case "knowledge":
                return "Matched local advisories and prior scam patterns to current facts.";
            case "counterfeit":
                return "Compared security-thread, watermark, and serial templates against RBI references.";
            case "entity":
                return "Unified citizen, phone, UPI, and bank entities into a single investigation graph.";
            default:
                return "Agent analysis complete.";
        }
    }

    private async runAnalysisPipeline(sessionId: string) {
        const session = this.state.analysisSessions.find((item) => item.id === sessionId);
        if (!session) {
            return;
        }

        const investigation = this.getInvestigation(session.investigationId);
        if (!investigation) {
            return;
        }

        for (let index = 0; index < AI_STAGES.length; index += 1) {
            const stage = AI_STAGES[index];

            this.updateAnalysisSession(sessionId, (currentSession) => {
                currentSession.currentStage = stage.key;
                currentSession.currentStageLabel = stage.label;
                currentSession.stages = currentSession.stages.map((item, stageIndex) => ({
                    ...item,
                    status: stageIndex < index ? "completed" : stageIndex === index ? "running" : "pending",
                    progress: stageIndex < index ? 100 : stageIndex === index ? 20 : 0,
                }));
                currentSession.queue = AI_STAGES.slice(index + 1).map((item) => item.key);
                currentSession.liveProgress = Math.min(100, 8 + Math.round((index / AI_STAGES.length) * 86));
                currentSession.status = "running";
            });

            this.appendTimeline(investigation.id, {
                id: nextId("TL"),
                timestamp: new Date(),
                type: `stage_${stage.key}_started`,
                description: `${stage.label} started.`,
                severity: index >= 4 ? "high" : "medium",
            });

            this.recordAnalysisOutput(investigation.id, {
                stage: stage.key,
                title: stage.label,
                summary: `${stage.label} is processing the live investigation data.`,
                confidence: session.confidenceScore,
                createdAt: new Date(),
            });

            this.markReportSection(sessionId, stage.label, "running", `${stage.label} is in progress.`);

            if (stage.key === "evidence_collection") {
                this.updateInvestigation(investigation.id, {
                    summary: `${investigation.summary} Evidence package ingested.`,
                });
                this.recordRiskHistory(investigation.id, {
                    investigationId: investigation.id,
                    score: Math.min(99, investigation.riskScore - 4),
                    level: investigation.riskLevel,
                    factors: ["Complaint intake", "Evidence collection"],
                    updatedAt: new Date(),
                });
            }

            if (stage.key === "evidence_validation") {
                this.updateInvestigation(investigation.id, {
                    summary: `${investigation.summary} Evidence validation underway.`,
                });
                this.recordAnalysisOutput(investigation.id, {
                    stage: stage.key,
                    title: stage.label,
                    summary: "Metadata, consistency, and submission integrity checks completed.",
                    confidence: Math.min(99, session.confidenceScore + 4),
                    createdAt: new Date(),
                });
            }

            if (stage.key === "parallel_agents") {
                await this.runParallelAgents(sessionId, investigation);
            }

            if (stage.key === "risk_fusion") {
                const fusedScore = Math.min(99, Math.round((investigation.riskScore + session.confidenceScore) / 2));
                this.updateInvestigation(investigation.id, {
                    riskScore: fusedScore,
                    riskLevel: fusedScore > 85 ? "critical" : fusedScore > 65 ? "high" : fusedScore > 40 ? "medium" : "low",
                });
                this.recordRiskHistory(investigation.id, {
                    investigationId: investigation.id,
                    score: fusedScore,
                    level: fusedScore > 85 ? "critical" : fusedScore > 65 ? "high" : fusedScore > 40 ? "medium" : "low",
                    factors: ["Risk fusion", "Agent consensus"],
                    updatedAt: new Date(),
                });
            }

            if (stage.key === "cross_intelligence_correlation") {
                const similarCases = this.state.investigations
                    .filter((item) => item.id !== investigation.id && item.type === investigation.type)
                    .slice(0, 3);

                this.updateAnalysisSession(sessionId, (currentSession) => {
                    currentSession.relatedCaseIds = similarCases.map((item) => item.id);
                    currentSession.explainableAI = {
                        ...currentSession.explainableAI,
                        historicalSimilarCases: similarCases.map(similarCaseLabel),
                    };
                });
            }

            if (stage.key === "explainable_ai") {
                const evidenceNames = session.evidenceNames.length > 0 ? session.evidenceNames : ["Complaint transcript"];
                const explainableAI = this.buildExplainableResult(investigation, evidenceNames, Math.min(99, Math.round(investigation.riskScore * 0.85)));
                this.updateAnalysisSession(sessionId, (currentSession) => {
                    currentSession.explainableAI = explainableAI;
                    currentSession.confidenceScore = explainableAI.confidenceScore;
                    currentSession.outputs = [
                        ...currentSession.outputs.filter((item) => item.stage !== stage.key),
                        {
                            stage: stage.key,
                            title: stage.label,
                            summary: explainableAI.reason,
                            confidence: explainableAI.confidenceScore,
                            createdAt: new Date(),
                        },
                    ];
                });
            }

            await wait(stage.duration);

            this.updateAnalysisSession(sessionId, (currentSession) => {
                currentSession.stages = currentSession.stages.map((item) =>
                    item.stage === stage.key
                        ? { ...item, status: "completed", progress: 100 }
                        : item
                );
                currentSession.completedAgents = currentSession.agents.filter((item) => item.status === "completed").length;
                currentSession.runningAgents = currentSession.agents.filter((item) => item.status === "running").length;
                currentSession.liveProgress = Math.min(100, 12 + Math.round(((index + 1) / AI_STAGES.length) * 88));
                currentSession.confidenceScore = stage.key === "risk_fusion"
                    ? Math.min(99, currentSession.confidenceScore + 6)
                    : currentSession.confidenceScore;
            });

            this.appendTimeline(investigation.id, {
                id: nextId("TL"),
                timestamp: new Date(),
                type: `stage_${stage.key}_completed`,
                description: `${stage.label} completed.`,
                severity: index >= 4 ? "high" : "medium",
            });

            this.markReportSection(sessionId, stage.label, "completed", `${stage.label} completed successfully.`);
        }

        const finalConfidence = Math.min(99, session.confidenceScore + 4);
        const finalRiskLevel: Location["risk"] = finalConfidence > 85 ? "critical" : finalConfidence > 65 ? "high" : finalConfidence > 40 ? "medium" : "low";

        this.updateInvestigation(investigation.id, {
            status: "investigation",
            riskScore: finalConfidence,
            riskLevel: finalRiskLevel,
            summary: `${investigation.summary} Investigation is ready for court reporting.`,
            reportIds: [
                ...(investigation.reportIds || []),
            ],
            officerNotes: [
                ...((investigation.officerNotes || [])),
                "AI pipeline completed and evidence is explainable for court review.",
            ],
            relatedCases: Array.from(new Set([...(investigation.relatedCases || []), ...session.relatedCaseIds])),
        });

        const finalReport = await this.generateReport(investigation.id);
        this.updateInvestigation(investigation.id, {
            reportIds: Array.from(new Set([...(investigation.reportIds || []), finalReport.id])),
            aiOutputs: [
                ...(this.getInvestigation(investigation.id)?.aiOutputs || []),
                {
                    stage: "court_ready_report",
                    title: "Court Ready Report",
                    summary: "Final report assembled with evidence, graph, geo, risk, and recommendations.",
                    confidence: finalConfidence,
                    createdAt: new Date(),
                },
            ],
        });

        this.updateAnalysisSession(sessionId, (currentSession) => {
            currentSession.currentStage = "court_ready_report";
            currentSession.currentStageLabel = "Court Ready Report";
            currentSession.status = "completed";
            currentSession.queue = [];
            currentSession.liveProgress = 100;
            currentSession.confidenceScore = finalConfidence;
            currentSession.completedAt = new Date();
            currentSession.reportSections = currentSession.reportSections.map((section) => ({
                ...section,
                status: "completed",
            }));
            currentSession.outputs = [
                ...currentSession.outputs,
                {
                    stage: "court_ready_report",
                    title: "Court Ready Report",
                    summary: finalReport.content,
                    confidence: finalConfidence,
                    createdAt: new Date(),
                },
            ];
        });

        this.recordRiskHistory(investigation.id, {
            investigationId: investigation.id,
            score: finalConfidence,
            level: finalRiskLevel,
            factors: ["Pipeline completed", "Court ready report generated"],
            updatedAt: new Date(),
        });

        this.appendTimeline(investigation.id, {
            id: nextId("TL"),
            timestamp: new Date(),
            type: "report_generated",
            description: "Court ready report generated.",
            severity: finalRiskLevel === "critical" ? "critical" : "high",
        });

        this.notify();
    }

    async createComplaint(input: CreateComplaintInput) {
        await wait(250);
        const risk = deriveRisk(input.description);
        const investigationId = nextId("INV-2026");
        const location = this.state.locations[0];
        const evidenceNames = (input.evidence || []).map((item) => item.name);

        const investigation: Investigation = {
            id: investigationId,
            type: input.type,
            title: input.title,
            status: "active",
            riskLevel: risk.level,
            riskScore: risk.score,
            createdAt: new Date(),
            updatedAt: new Date(),
            citizenName: input.citizenName,
            phoneNumber: input.phoneNumber,
            upiId: input.upiId,
            description: input.description,
            source: input.source,
            location: location
                ? {
                    ...location,
                    caseCount: location.caseCount + 1,
                    investigationIds: [...location.investigationIds, investigationId],
                }
                : undefined,
            evidenceIds: [],
            alertIds: [],
            relatedEntityIds: [],
            timeline: [
                {
                    id: nextId("TL"),
                    timestamp: new Date(),
                    type: "complaint_filed",
                    description: `Complaint submitted by ${input.citizenName}.`,
                    severity: risk.level === "critical" ? "critical" : "high",
                },
            ],
            summary: input.description,
            assignedOfficer: risk.level === "critical" ? "Cyber Intelligence Desk" : undefined,
        };

        const alert = this.createAlert({
            title: `${input.title} flagged`,
            description: `Risk score ${risk.score} generated from complaint analysis.`,
            severity: risk.level,
            caseId: investigationId,
            source: input.source,
        });

        investigation.alertIds.push(alert.id);

        const evidence: Evidence[] = (input.evidence || []).map((item) => ({
            ...item,
            caseId: investigationId,
            uploadedAt: new Date(),
            id: nextId("EV"),
        }));

        evidence.forEach((item) => {
            investigation.evidenceIds.push(item.id);
            this.state.evidence.push(item);
        });

        this.state.investigations = [investigation, ...this.state.investigations];
        this.state.riskAssessments = [
            {
                investigationId,
                score: risk.score,
                level: risk.level,
                factors: risk.factors,
                updatedAt: new Date(),
            },
            ...this.state.riskAssessments,
        ];
        this.state.timeline = [...investigation.timeline, ...this.state.timeline];

        this.syncGraphFromInvestigation(investigation);
        this.syncNotificationsFromAlert(alert);
        this.syncReportFromInvestigation(investigation);

        if (investigation.location) {
            this.syncLocation(investigation.location);
        }

        const session = this.createAnalysisSession(investigation, evidenceNames);
        void this.runAnalysisPipeline(session.id);

        this.notify();

        return { investigation, alert, evidence, risk };
    }

    async analyzeDigitalArrest(input: DigitalArrestInput) {
        await wait(350);
        const risk = deriveRisk(`${input.transcript} ${input.keywords.join(" ")}`);
        const result = await this.createComplaint({
            citizenName: input.recipientName,
            description: input.transcript,
            phoneNumber: input.callerId,
            source: "digital_arrest",
            title: "Digital Arrest Detection",
            type: "digital_arrest",
            evidence: [
                {
                    type: "audio",
                    name: `Call_${input.callerId.replace(/\W/g, "")}.wav`,
                    size: 2048000,
                    metadata: { callerId: input.callerId, keywords: input.keywords },
                },
            ],
        });

        const timelineEvent: TimelineEvent = {
            id: nextId("TL"),
            timestamp: new Date(),
            type: "transcript_analyzed",
            description: "Transcript analyzed and entities extracted.",
            severity: risk.level === "critical" ? "critical" : "high",
        };

        this.appendTimeline(result.investigation.id, timelineEvent);
        this.upsertGraphEntity(result.investigation.id, input.callerId, "phone", input.recipientName);
        this.notify();

        return result;
    }

    async analyzeCounterfeit(input: CounterfeitInput) {
        await wait(300);
        const risk = deriveRisk(input.noteSummary);
        const result = await this.createComplaint({
            citizenName: "Anonymous Citizen",
            description: input.noteSummary,
            source: "counterfeit",
            title: "Counterfeit Currency Detection",
            type: "counterfeit",
            evidence: [
                {
                    type: "image",
                    name: input.evidenceName,
                    size: 1024000,
                    metadata: { denomination: input.denomination },
                },
            ],
        });

        this.updateInvestigation(result.investigation.id, {
            summary: `${input.denomination} analysis completed with ${risk.level} risk outcome.`,
            riskLevel: risk.level,
            riskScore: risk.score,
        });

        this.upsertLocation(result.investigation.location?.city ?? "Delhi", result.investigation.location?.state ?? "Delhi", result.investigation.id, risk.level);
        this.notify();
        return result;
    }

    async generateReport(investigationId: string) {
        await wait(200);
        const investigation = this.state.investigations.find((item) => item.id === investigationId);
        if (!investigation) {
            throw new Error("Investigation not found");
        }

        const report: ReportRecord = {
            id: nextId("RP"),
            investigationId,
            title: `${investigation.title} Report`,
            generatedAt: new Date(),
            content: [
                `Case: ${investigation.id}`,
                `Risk: ${investigation.riskLevel} (${investigation.riskScore})`,
                `Status: ${investigation.status}`,
                `Description: ${investigation.description}`,
            ].join("\n"),
        };

        this.state.reports = [report, ...this.state.reports.filter((item) => item.investigationId !== investigationId)];
        this.notify();
        return report;
    }

    resolveInvestigation(investigationId: string) {
        this.updateInvestigation(investigationId, { status: "closed" });
        this.state.alerts = this.state.alerts.map((alert) =>
            alert.caseId === investigationId ? { ...alert, resolved: true } : alert
        );
        this.notify();
    }

    searchKnowledgeBase(query: string) {
        return this.getKnowledgeEntries(query);
    }

    setSelectedInvestigationType(type: string | null) {
        this.state.selectedInvestigationType = type;
        this.notify();
    }

    private createAlert(input: Omit<Alert, "id" | "timestamp" | "resolved"> & { severity: Alert["severity"] }) {
        const alert: Alert = {
            id: nextId("ALERT"),
            title: input.title,
            description: input.description,
            timestamp: new Date(),
            severity: input.severity,
            caseId: input.caseId,
            resolved: false,
            source: input.source,
        };

        this.state.alerts = [alert, ...this.state.alerts].slice(0, 50);
        return alert;
    }

    private syncNotificationsFromAlert(alert: Alert) {
        const notification: NotificationItem = {
            id: nextId("NT"),
            title: alert.title,
            description: alert.description,
            timestamp: alert.timestamp,
            read: false,
            severity: alert.severity,
            caseId: alert.caseId,
            action: "Open investigation",
        };
        this.state.notifications = [notification, ...this.state.notifications].slice(0, 50);
    }

    private syncReportFromInvestigation(investigation: Investigation) {
        const report: ReportRecord = {
            id: nextId("RP"),
            investigationId: investigation.id,
            title: `${investigation.title} Summary`,
            generatedAt: new Date(),
            content: `${investigation.description}\nRisk: ${investigation.riskLevel}\nScore: ${investigation.riskScore}`,
        };
        this.state.reports = [report, ...this.state.reports.filter((item) => item.investigationId !== investigation.id)];
    }

    private syncGraphFromInvestigation(investigation: Investigation) {
        const nodes = new Map(this.state.graphNodes.map((node) => [node.id, node]));
        const edges = [...this.state.graphEdges];

        const addNode = (node: GraphNode) => {
            const existing = nodes.get(node.id);
            if (existing) {
                nodes.set(node.id, {
                    ...existing,
                    riskScore: Math.max(existing.riskScore, node.riskScore),
                    connections: Math.max(existing.connections, node.connections),
                    investigationIds: Array.from(new Set([...existing.investigationIds, ...node.investigationIds])),
                });
                return;
            }

            nodes.set(node.id, node);
        };

        if (investigation.citizenName) {
            addNode({
                id: `citizen_${investigation.id}`,
                label: investigation.citizenName,
                type: "citizen",
                riskScore: investigation.riskScore,
                connections: 1,
                investigationIds: [investigation.id],
            });
        }

        if (investigation.phoneNumber) {
            addNode({
                id: `phone_${investigation.phoneNumber.replace(/\W/g, "")}`,
                label: investigation.phoneNumber,
                type: "phone",
                riskScore: investigation.riskScore,
                connections: 2,
                investigationIds: [investigation.id],
            });
        }

        if (investigation.upiId) {
            addNode({
                id: `upi_${investigation.upiId.replace(/\W/g, "")}`,
                label: investigation.upiId,
                type: "upi",
                riskScore: investigation.riskScore,
                connections: 2,
                investigationIds: [investigation.id],
            });
        }

        if (investigation.location) {
            addNode({
                id: `location_${investigation.location.city.toLowerCase()}`,
                label: investigation.location.city,
                type: "location",
                riskScore: investigation.riskScore,
                connections: 1,
                investigationIds: [investigation.id],
            });
        }

        if (investigation.phoneNumber) {
            edges.push({
                source: `citizen_${investigation.id}`,
                target: `phone_${investigation.phoneNumber.replace(/\W/g, "")}`,
                type: "reported_with",
                weight: 1,
                investigationId: investigation.id,
            });
        }

        if (investigation.upiId) {
            edges.push({
                source: `citizen_${investigation.id}`,
                target: `upi_${investigation.upiId.replace(/\W/g, "")}`,
                type: "reported_with",
                weight: 1,
                investigationId: investigation.id,
            });
        }

        this.state.graphNodes = Array.from(nodes.values());
        this.state.graphEdges = edges;
    }

    private syncLocation(location: Location) {
        const existing = this.state.locations.find((item) => item.city === location.city);
        if (existing) {
            this.state.locations = this.state.locations.map((item) =>
                item.city === location.city
                    ? {
                        ...item,
                        caseCount: location.caseCount,
                        risk: location.risk,
                        investigationIds: Array.from(new Set([...item.investigationIds, ...location.investigationIds])),
                    }
                    : item
            );
            return;
        }

        this.state.locations = [location, ...this.state.locations];
    }

    private upsertLocation(city: string, state: string, investigationId: string, risk: Location["risk"]) {
        const existing = this.state.locations.find((location) => location.city === city);
        if (existing) {
            this.state.locations = this.state.locations.map((location) =>
                location.city === city
                    ? {
                        ...location,
                        risk,
                        caseCount: location.caseCount + 1,
                        investigationIds: Array.from(new Set([...location.investigationIds, investigationId])),
                    }
                    : location
            );
            return;
        }

        this.state.locations = [
            {
                city,
                state,
                lat: 0,
                lng: 0,
                risk,
                caseCount: 1,
                investigationIds: [investigationId],
            },
            ...this.state.locations,
        ];
    }

    private appendTimeline(investigationId: string, event: TimelineEvent) {
        this.state.investigations = this.state.investigations.map((investigation) =>
            investigation.id === investigationId
                ? {
                    ...investigation,
                    timeline: [event, ...investigation.timeline],
                    updatedAt: new Date(),
                }
                : investigation
        );
        this.state.timeline = [event, ...this.state.timeline];
    }

    private upsertGraphEntity(investigationId: string, label: string, type: GraphNode["type"], citizenName: string) {
        const id = `${type}_${label.replace(/\W/g, "")}`;
        const existing = this.state.graphNodes.find((node) => node.id === id);
        const node: GraphNode = {
            id,
            label: type === "phone" ? label : citizenName,
            type,
            riskScore: 90,
            connections: existing ? existing.connections + 1 : 1,
            investigationIds: Array.from(new Set([...(existing?.investigationIds || []), investigationId])),
        };

        this.state.graphNodes = [node, ...this.state.graphNodes.filter((item) => item.id !== id)];
    }

    updateInvestigation(id: string, data: Partial<Investigation>) {
        this.state.investigations = this.state.investigations.map((investigation) =>
            investigation.id === id ? { ...investigation, ...data, updatedAt: new Date() } : investigation
        );
        this.notify();
    }

    addNotification(notification: NotificationItem) {
        this.state.notifications = [notification, ...this.state.notifications].slice(0, 50);
        this.notify();
    }
}
