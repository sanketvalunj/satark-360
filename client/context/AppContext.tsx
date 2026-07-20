import { createContext, useContext, useSyncExternalStore } from "react";
import { platformEngine } from "@/engine";
import { InvestigationService } from "@/services/investigationService";
import { KnowledgeService } from "@/services/knowledgeService";
import { GraphService } from "@/services/graphService";
import { GeoService } from "@/services/geoService";
import { NotificationService } from "@/services/notificationService";
import type {
    Alert,
    AIAnalysisSession,
    DashboardSnapshot,
    Evidence,
    GraphEdge,
    GraphNode,
    Investigation,
    Location,
    NotificationItem,
    ReportRecord,
    RiskAssessment,
} from "@/engine/types";

interface AppContextType {
    investigations: Investigation[];
    evidence: Evidence[];
    alerts: Alert[];
    graphNodes: GraphNode[];
    graphEdges: GraphEdge[];
    locations: Location[];
    notifications: NotificationItem[];
    riskAssessments: RiskAssessment[];
    reports: ReportRecord[];
    analysisSessions: AIAnalysisSession[];
    knowledgeBase: ReturnType<typeof KnowledgeService.search>;
    selectedInvestigationType: string | null;
    setSelectedInvestigationType: (type: string | null) => void;
    createInvestigation: (data: Omit<Investigation, "id" | "riskScore" | "source" | "evidenceIds" | "alertIds" | "relatedEntityIds" | "timeline" | "summary" | "updatedAt" | "createdAt">) => Promise<Investigation>;
    updateInvestigation: (id: string, data: Partial<Investigation>) => void;
    deleteInvestigation: (id: string) => void;
    getInvestigation: (id: string) => Investigation | undefined;
    addEvidence: (caseId: string, evidence: Omit<Evidence, "id" | "caseId" | "uploadedAt">) => Promise<Evidence>;
    getEvidenceByCase: (caseId: string) => Evidence[];
    addAlert: (alert: Omit<Alert, "id" | "timestamp" | "resolved">) => Alert;
    resolveAlert: (id: string) => void;
    getActiveAlerts: () => Alert[];
    addGraphNode: (node: Omit<GraphNode, "id">) => GraphNode;
    addGraphEdge: (edge: GraphEdge) => GraphEdge;
    updateLocation: (city: string, location: Partial<Location>) => void;
    getStats: () => DashboardSnapshot;
    getReportByInvestigation: (investigationId: string) => ReportRecord | undefined;
    getAnalysisSession: (investigationId: string) => AIAnalysisSession | undefined;
    getActiveAnalysisSessions: () => AIAnalysisSession[];
    getKnowledgeEntries: (query: string) => ReturnType<typeof KnowledgeService.search>;
    generateReport: (investigationId: string) => Promise<ReportRecord>;
    resolveInvestigation: (investigationId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function useEngineVersion() {
    return useSyncExternalStore(
        (listener) => platformEngine.subscribe(listener),
        () => platformEngine.getVersion(),
        () => platformEngine.getVersion()
    );
}

function useEngineState() {
    useEngineVersion();
    return platformEngine.getState();
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    const state = useEngineState();
    const snapshot = platformEngine.getSnapshot();

    const value: AppContextType = {
        investigations: state.investigations,
        evidence: state.evidence,
        alerts: state.alerts,
        graphNodes: state.graphNodes,
        graphEdges: state.graphEdges,
        locations: state.locations,
        notifications: NotificationService.getNotifications(),
        riskAssessments: state.riskAssessments,
        reports: state.reports,
        analysisSessions: state.analysisSessions,
        knowledgeBase: KnowledgeService.search(""),
        selectedInvestigationType: state.selectedInvestigationType,
        setSelectedInvestigationType: (type) => platformEngine.setSelectedInvestigationType(type),
        createInvestigation: async (data) => {
            const result = await InvestigationService.createComplaint({
                citizenName: data.citizenName ?? "Anonymous Citizen",
                description: data.description,
                phoneNumber: data.phoneNumber,
                upiId: data.upiId,
                source: "citizen",
                title: data.title,
                type: data.type,
            });
            return result.investigation;
        },
        updateInvestigation: (id, data) => platformEngine.updateInvestigation(id, data),
        deleteInvestigation: (id) => platformEngine.deleteInvestigation(id),
        getInvestigation: (id) => platformEngine.getInvestigation(id),
        addEvidence: async (caseId, evidence) => platformEngine.addEvidence(caseId, evidence),
        getEvidenceByCase: (caseId) => platformEngine.getEvidenceByCase(caseId),
        addAlert: (alert) => platformEngine.addAlert(alert),
        resolveAlert: (id) => platformEngine.resolveAlert(id),
        getActiveAlerts: () => state.alerts.filter((alert) => !alert.resolved),
        addGraphNode: (node) => platformEngine.addGraphNode(node),
        addGraphEdge: (edge) => platformEngine.addGraphEdge(edge),
        updateLocation: (city, location) => platformEngine.updateLocation(city, location),
        getStats: () => snapshot,
        getReportByInvestigation: (investigationId) => state.reports.find((report) => report.investigationId === investigationId),
        getAnalysisSession: (investigationId) => platformEngine.getAnalysisSession(investigationId),
        getActiveAnalysisSessions: () => platformEngine.getActiveAnalysisSessions(),
        getKnowledgeEntries: (query) => KnowledgeService.search(query),
        generateReport: InvestigationService.generateReport,
        resolveInvestigation: InvestigationService.resolveInvestigation,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within AppProvider");
    }
    return context;
}

export function useInvestigationStore() {
    const app = useApp();
    return {
        investigations: app.investigations,
        selectedInvestigationType: app.selectedInvestigationType,
        setSelectedInvestigationType: app.setSelectedInvestigationType,
        createInvestigation: app.createInvestigation,
        updateInvestigation: app.updateInvestigation,
        deleteInvestigation: app.deleteInvestigation,
        getInvestigation: app.getInvestigation,
        getStats: app.getStats,
        getAnalysisSession: app.getAnalysisSession,
    };
}

export function useEvidenceStore() {
    const app = useApp();
    return {
        evidence: app.evidence,
        addEvidence: app.addEvidence,
        getEvidenceByCase: app.getEvidenceByCase,
    };
}

export function useAlertStore() {
    const app = useApp();
    return {
        alerts: app.alerts,
        addAlert: app.addAlert,
        resolveAlert: app.resolveAlert,
        getActiveAlerts: app.getActiveAlerts,
    };
}

export function useGraphStore() {
    const app = useApp();
    return {
        graphNodes: app.graphNodes,
        graphEdges: app.graphEdges,
        addGraphNode: app.addGraphNode,
        addGraphEdge: app.addGraphEdge,
    };
}

export function useGeoStore() {
    const app = useApp();
    return {
        locations: app.locations,
        updateLocation: app.updateLocation,
    };
}

export function useNotificationStore() {
    const app = useApp();
    return {
        notifications: app.notifications,
    };
}

