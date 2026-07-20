import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface Location {
  city: string;
  state: string;
  lat: number;
  lng: number;
  risk: "low" | "medium" | "high" | "critical";
  caseCount: number;
}

export interface Evidence {
  id: string;
  caseId: string;
  type: "image" | "audio" | "video" | "pdf" | "qr" | "text";
  name: string;
  uploadedAt: Date;
  size: number;
  metadata?: Record<string, any>;
}

export interface Investigation {
  id: string;
  type:
    | "digital_arrest"
    | "counterfeit"
    | "banking_fraud"
    | "fraud_network"
    | "other";
  status: "active" | "review" | "closed" | "investigation";
  riskLevel: "low" | "medium" | "high" | "critical";
  createdAt: Date;
  updatedAt: Date;
  citizenName?: string;
  phoneNumber?: string;
  upiId?: string;
  description: string;
  evidence: Evidence[];
  timeline: TimelineEvent[];
  relatedCases: string[];
  officer?: string;
  location?: Location;
}

export interface TimelineEvent {
  timestamp: Date;
  type: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
  caseId?: string;
  resolved: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "person" | "phone" | "upi" | "device" | "location" | "bank" | "complaint";
  riskScore: number;
  connections: number;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
  label?: string;
}

interface AppContextType {
  // Investigations
  investigations: Investigation[];
  createInvestigation: (data: Omit<Investigation, "id">) => Investigation;
  updateInvestigation: (id: string, data: Partial<Investigation>) => void;
  deleteInvestigation: (id: string) => void;
  getInvestigation: (id: string) => Investigation | undefined;

  // Evidence
  addEvidence: (caseId: string, evidence: Omit<Evidence, "id">) => void;
  getEvidenceByCase: (caseId: string) => Evidence[];

  // Alerts
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, "id">) => void;
  resolveAlert: (id: string) => void;
  getActiveAlerts: () => Alert[];

  // Graph Data
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  addGraphNode: (node: Omit<GraphNode, "id">) => void;
  addGraphEdge: (edge: GraphEdge) => void;

  // Locations
  locations: Location[];
  updateLocation: (city: string, location: Partial<Location>) => void;

  // Statistics
  getStats: () => {
    totalCases: number;
    activeCases: number;
    highRiskAlerts: number;
    fraudsPrevented: number;
    networkNodes: number;
    digitalArrestCases: number;
    counterfeitCases: number;
    hotspots: number;
  };

  // Filters
  selectedInvestigationType: string | null;
  setSelectedInvestigationType: (type: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedInvestigationType, setSelectedInvestigationType] = useState<
    string | null
  >(null);

  // Initialize with demo data
  useEffect(() => {
    initializeDemoData();
  }, []);

  const initializeDemoData = () => {
    // Demo investigations
    const demoInvestigations: Investigation[] = [
      {
        id: "INV-2024-0001",
        type: "digital_arrest",
        status: "active",
        riskLevel: "critical",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        citizenName: "Rajesh Kumar",
        phoneNumber: "+91-9876543210",
        description: "Victim received calls impersonating Police Commissioner",
        evidence: [],
        timeline: [
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            type: "complaint_filed",
            description: "Digital arrest complaint registered",
            severity: "critical",
          },
          {
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
            type: "call_analyzed",
            description: "Audio analysis completed - 3 incoming calls detected",
            severity: "high",
          },
        ],
        relatedCases: [],
        officer: "Inspector Sharma",
        location: {
          city: "Mumbai",
          state: "Maharashtra",
          lat: 19.076,
          lng: 72.8777,
          risk: "critical",
          caseCount: 8,
        },
      },
      {
        id: "INV-2024-0002",
        type: "counterfeit",
        status: "review",
        riskLevel: "high",
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        updatedAt: new Date(),
        description: "Counterfeit currency notes identified",
        evidence: [],
        timeline: [
          {
            timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
            type: "evidence_uploaded",
            description: "Currency images uploaded",
            severity: "high",
          },
        ],
        relatedCases: [],
        location: {
          city: "Delhi",
          state: "Delhi",
          lat: 28.6139,
          lng: 77.209,
          risk: "high",
          caseCount: 12,
        },
      },
      {
        id: "INV-2024-0003",
        type: "banking_fraud",
        status: "investigation",
        riskLevel: "high",
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
        updatedAt: new Date(),
        description: "UPI fraud - Money transferred to unknown account",
        evidence: [],
        timeline: [],
        relatedCases: ["INV-2024-0004"],
        location: {
          city: "Bangalore",
          state: "Karnataka",
          lat: 12.9716,
          lng: 77.5946,
          risk: "high",
          caseCount: 5,
        },
      },
      {
        id: "INV-2024-0004",
        type: "fraud_network",
        status: "active",
        riskLevel: "critical",
        createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000),
        updatedAt: new Date(),
        description: "Network of 15 fraudsters operating across 3 states",
        evidence: [],
        timeline: [],
        relatedCases: ["INV-2024-0003"],
        location: {
          city: "Kolkata",
          state: "West Bengal",
          lat: 22.5726,
          lng: 88.364,
          risk: "critical",
          caseCount: 18,
        },
      },
    ];

    const demoAlerts: Alert[] = [
      {
        id: "ALERT-1",
        title: "Suspicious Call Pattern Detected",
        description: "High frequency calls from 3 numbers to single recipient",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        severity: "critical",
        caseId: "INV-2024-0001",
        resolved: false,
      },
      {
        id: "ALERT-2",
        title: "Counterfeit Currency Identified",
        description: "RBI template mismatch detected in uploaded image",
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        severity: "high",
        caseId: "INV-2024-0002",
        resolved: false,
      },
      {
        id: "ALERT-3",
        title: "Network Anomaly Detected",
        description: "New UPI-based money transfer network identified",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        severity: "high",
        caseId: "INV-2024-0004",
        resolved: false,
      },
    ];

    const demoGraphNodes: GraphNode[] = [
      {
        id: "person_rajesh",
        label: "Rajesh Kumar",
        type: "person",
        riskScore: 95,
        connections: 5,
      },
      {
        id: "phone_9876543210",
        label: "+91-9876543210",
        type: "phone",
        riskScore: 88,
        connections: 8,
      },
      {
        id: "phone_9988776655",
        label: "+91-9988776655",
        type: "phone",
        riskScore: 92,
        connections: 12,
      },
      {
        id: "upi_scammer",
        label: "scammer.upi@bank",
        type: "upi",
        riskScore: 98,
        connections: 15,
      },
      {
        id: "device_imei",
        label: "Device A (IMEI: 12345)",
        type: "device",
        riskScore: 85,
        connections: 6,
      },
      {
        id: "location_mumbai",
        label: "Mumbai HQ",
        type: "location",
        riskScore: 87,
        connections: 10,
      },
      {
        id: "bank_icici",
        label: "ICICI Account",
        type: "bank",
        riskScore: 90,
        connections: 8,
      },
    ];

    const demoGraphEdges: GraphEdge[] = [
      {
        source: "person_rajesh",
        target: "phone_9876543210",
        type: "owns",
        weight: 1,
      },
      {
        source: "phone_9876543210",
        target: "phone_9988776655",
        type: "calls",
        weight: 15,
      },
      {
        source: "phone_9988776655",
        target: "upi_scammer",
        type: "transfers_to",
        weight: 8,
      },
      {
        source: "upi_scammer",
        target: "device_imei",
        type: "accessed_from",
        weight: 1,
      },
      {
        source: "phone_9876543210",
        target: "location_mumbai",
        type: "located_at",
        weight: 1,
      },
      {
        source: "upi_scammer",
        target: "bank_icici",
        type: "linked_to",
        weight: 1,
      },
    ];

    const demoLocations: Location[] = [
      {
        city: "Mumbai",
        state: "Maharashtra",
        lat: 19.076,
        lng: 72.8777,
        risk: "critical",
        caseCount: 8,
      },
      {
        city: "Delhi",
        state: "Delhi",
        lat: 28.6139,
        lng: 77.209,
        risk: "high",
        caseCount: 12,
      },
      {
        city: "Bangalore",
        state: "Karnataka",
        lat: 12.9716,
        lng: 77.5946,
        risk: "high",
        caseCount: 5,
      },
      {
        city: "Kolkata",
        state: "West Bengal",
        lat: 22.5726,
        lng: 88.364,
        risk: "critical",
        caseCount: 18,
      },
      {
        city: "Pune",
        state: "Maharashtra",
        lat: 18.5204,
        lng: 73.8567,
        risk: "medium",
        caseCount: 3,
      },
      {
        city: "Hyderabad",
        state: "Telangana",
        lat: 17.3850,
        lng: 78.4867,
        risk: "high",
        caseCount: 7,
      },
    ];

    setInvestigations(demoInvestigations);
    setAlerts(demoAlerts);
    setGraphNodes(demoGraphNodes);
    setGraphEdges(demoGraphEdges);
    setLocations(demoLocations);
  };

  const createInvestigation = useCallback(
    (data: Omit<Investigation, "id">): Investigation => {
      const investigation: Investigation = {
        ...data,
        id: `INV-2024-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      };
      setInvestigations((prev) => [...prev, investigation]);

      // Auto-add alert for new critical cases
      if (data.riskLevel === "critical") {
        addAlert({
          title: `New ${data.type.replace("_", " ")} case created`,
          description: data.description,
          timestamp: new Date(),
          severity: "high",
          caseId: investigation.id,
          resolved: false,
        });
      }

      return investigation;
    },
    []
  );

  const updateInvestigation = useCallback(
    (id: string, data: Partial<Investigation>) => {
      setInvestigations((prev) =>
        prev.map((inv) =>
          inv.id === id ? { ...inv, ...data, updatedAt: new Date() } : inv
        )
      );
    },
    []
  );

  const deleteInvestigation = useCallback((id: string) => {
    setInvestigations((prev) => prev.filter((inv) => inv.id !== id));
  }, []);

  const getInvestigation = useCallback(
    (id: string) => investigations.find((inv) => inv.id === id),
    [investigations]
  );

  const addEvidence = useCallback(
    (caseId: string, evidence: Omit<Evidence, "id">) => {
      const newEvidence: Evidence = {
        ...evidence,
        id: `EV-${Math.random().toString(36).substr(2, 8)}`,
      };
      updateInvestigation(caseId, {
        evidence: [
          ...(getInvestigation(caseId)?.evidence || []),
          newEvidence,
        ],
      });
    },
    [updateInvestigation, getInvestigation]
  );

  const getEvidenceByCase = useCallback(
    (caseId: string) => getInvestigation(caseId)?.evidence || [],
    [getInvestigation]
  );

  const addAlert = useCallback((alert: Omit<Alert, "id">) => {
    const newAlert: Alert = {
      ...alert,
      id: `ALERT-${Math.random().toString(36).substr(2, 6)}`,
    };
    setAlerts((prev) => [newAlert, ...prev].slice(0, 20)); // Keep last 20 alerts
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, resolved: true } : alert))
    );
  }, []);

  const getActiveAlerts = useCallback(
    () => alerts.filter((a) => !a.resolved),
    [alerts]
  );

  const addGraphNode = useCallback((node: Omit<GraphNode, "id">) => {
    const newNode: GraphNode = {
      ...node,
      id: `node_${Math.random().toString(36).substr(2, 8)}`,
    };
    setGraphNodes((prev) => [...prev, newNode]);
  }, []);

  const addGraphEdge = useCallback((edge: GraphEdge) => {
    setGraphEdges((prev) => [...prev, edge]);
  }, []);

  const updateLocation = useCallback(
    (city: string, location: Partial<Location>) => {
      setLocations((prev) =>
        prev.map((loc) =>
          loc.city === city ? { ...loc, ...location } : loc
        )
      );
    },
    []
  );

  const getStats = useCallback(() => {
    const activeCases = investigations.filter((i) => i.status === "active").length;
    const highRiskCases = investigations.filter(
      (i) => i.riskLevel === "high" || i.riskLevel === "critical"
    ).length;
    const digitalArrestCases = investigations.filter(
      (i) => i.type === "digital_arrest"
    ).length;
    const counterfeitCases = investigations.filter(
      (i) => i.type === "counterfeit"
    ).length;

    return {
      totalCases: investigations.length,
      activeCases,
      highRiskAlerts: getActiveAlerts().length,
      fraudsPrevented: Math.floor(investigations.length * 1.8),
      networkNodes: graphNodes.length,
      digitalArrestCases,
      counterfeitCases,
      hotspots: locations.filter((l) => l.risk === "critical" || l.risk === "high")
        .length,
    };
  }, [investigations, getActiveAlerts, graphNodes, locations]);

  return (
    <AppContext.Provider
      value={{
        investigations,
        createInvestigation,
        updateInvestigation,
        deleteInvestigation,
        getInvestigation,
        addEvidence,
        getEvidenceByCase,
        alerts,
        addAlert,
        resolveAlert,
        getActiveAlerts,
        graphNodes,
        graphEdges,
        addGraphNode,
        addGraphEdge,
        locations,
        updateLocation,
        getStats,
        selectedInvestigationType,
        setSelectedInvestigationType,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
