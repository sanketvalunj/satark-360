import { SatarkLayout } from "@/components/SatarkLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { useState, useEffect, useMemo } from "react";
import { InvestigationService } from "@/services/investigationService";
import { AIPipelinePanel } from "@/components/AIPipelinePanel";
import {
  Phone,
  Pause,
  Play,
  Volume2,
  AlertTriangle,
  TrendingUp,
  Eye,
  Zap,
  Clock,
  User,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallSession {
  id: string;
  callerId: string;
  recipientName: string;
  duration: number;
  startTime: Date;
  keywords: string[];
  riskScore: number;
  status: "ongoing" | "recorded";
  transcript: string;
  governmentImpersonation: boolean;
}

export default function DigitalArrest() {
  const { investigations, analysisSessions, getAnalysisSession } = useApp();
  const [activeSessions, setActiveSessions] = useState<CallSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<CallSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [analysisInvestigationId, setAnalysisInvestigationId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const activePipelineSession = useMemo(
    () => analysisInvestigationId ? getAnalysisSession(analysisInvestigationId) : analysisSessions.find((session) => session.status !== "completed"),
    [analysisInvestigationId, analysisSessions, getAnalysisSession]
  );

  useEffect(() => {
    // Simulate active monitoring sessions
    const sessions: CallSession[] = [
      {
        id: "SESSION-001",
        callerId: "+91-9988776655",
        recipientName: "Rajesh Kumar",
        duration: 342,
        startTime: new Date(Date.now() - 5 * 60 * 1000),
        keywords: [
          "police",
          "arrest",
          "money",
          "account",
          "commissioner",
          "urgent",
        ],
        riskScore: 94,
        status: "ongoing",
        transcript: `Caller: "Hello, this is Inspector Sharma from Mumbai Police Commissioner's office. We have a case registered against your name. Your bank account has been linked to money laundering activities..."

Recipient: "What? But I haven't done anything wrong..."

Caller: "We need to verify your account immediately. Transfer all your money to a government secure account or we will arrest you within 24 hours."`,
        governmentImpersonation: true,
      },
      {
        id: "SESSION-002",
        callerId: "+91-8765432109",
        recipientName: "Priya Singh",
        duration: 156,
        startTime: new Date(Date.now() - 15 * 60 * 1000),
        keywords: ["court", "case", "bank", "secure", "aadhaar", "kyc"],
        riskScore: 87,
        status: "recorded",
        transcript: `Caller: "This is from the District Court. There's a case filed against you for unauthorized banking activities. We need to verify your KYC..."

Recipient: "I don't understand. Who are you?"

Caller: "From court registry. We need bank details to proceed with the case closure."`,
        governmentImpersonation: true,
      },
    ];

    setActiveSessions(sessions);
    if (sessions.length > 0) {
      setSelectedSession(sessions[0]);
    }

    // Simulate duration increment
    const interval = setInterval(() => {
      setActiveSessions((prev) =>
        prev.map((sess) =>
          sess.status === "ongoing"
            ? { ...sess, duration: sess.duration + 1 }
            : sess
        )
      );

      setSelectedSession((prev) => {
        if (prev && prev.status === "ongoing") {
          return { ...prev, duration: prev.duration + 1 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getKeywordSeverity = (keyword: string) => {
    const dangerousKeywords: Record<string, "critical" | "high"> = {
      arrest: "critical",
      police: "critical",
      commissioner: "critical",
      account: "high",
      money: "high",
      transfer: "critical",
      jail: "critical",
      court: "critical",
      urgent: "high",
    };
    return dangerousKeywords[keyword.toLowerCase()] || "high";
  };

  const riskMetrics = selectedSession
    ? [
      {
        label: "Government Impersonation",
        value: selectedSession.governmentImpersonation ? "Detected" : "None",
        severity: selectedSession.governmentImpersonation ? "critical" : "low",
      },
      {
        label: "Threat Level",
        value: `${selectedSession.riskScore}%`,
        severity:
          selectedSession.riskScore > 85
            ? "critical"
            : selectedSession.riskScore > 60
              ? "high"
              : "medium",
      },
      {
        label: "Psychological Pressure",
        value: selectedSession.keywords.includes("urgent") ? "Detected" : "None",
        severity: selectedSession.keywords.includes("urgent")
          ? "high"
          : "low",
      },
      {
        label: "Money Demand",
        value: selectedSession.keywords.includes("transfer")
          ? "Detected"
          : "None",
        severity: selectedSession.keywords.includes("transfer")
          ? "critical"
          : "low",
      },
    ]
    : [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const createInvestigationFromSession = async () => {
    if (!selectedSession) return;

    setIsCreatingCase(true);
    setStatusMessage("Call transcript received. Speech, caller, graph, and geo agents are starting.");
    try {
      const result = await InvestigationService.analyzeDigitalArrest({
        callerId: selectedSession.callerId,
        recipientName: selectedSession.recipientName,
        transcript: selectedSession.transcript,
        keywords: selectedSession.keywords,
      });
      setAnalysisInvestigationId(result.investigation.id);
      setStatusMessage("AI orchestration is coordinating parallel agents and cross-intelligence correlation.");
    } finally {
      setIsCreatingCase(false);
    }
  };

  return (
    <SatarkLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Digital Arrest Detection
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time AI monitoring for police impersonation scams
          </p>
        </div>

        {/* Active Sessions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video/Audio Preview */}
          <div className="lg:col-span-2">
            <Card className="h-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">
                  Live Monitoring
                </h2>
                <Badge variant={selectedSession?.status === "ongoing" ? "destructive" : "secondary"}>
                  {selectedSession?.status === "ongoing"
                    ? "🔴 Live"
                    : "⏹ Recorded"}
                </Badge>
              </div>

              {/* Video Placeholder */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg aspect-video flex items-center justify-center text-slate-400 mb-6">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Video stream simulation</p>
                  <p className="text-sm mt-2">
                    {selectedSession && formatDuration(selectedSession.duration)}
                  </p>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <Volume2 className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 h-2 bg-muted rounded-full cursor-pointer">
                  <div className="h-full bg-primary rounded-full w-1/3" />
                </div>
              </div>

              <Button
                onClick={createInvestigationFromSession}
                disabled={isCreatingCase}
                className="mb-6 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30"
              >
                {isCreatingCase ? "Creating Investigation..." : "Create Investigation From Call"}
              </Button>

              {statusMessage && (
                <Card className="mb-6 p-4 border-dashed border-border bg-muted/20">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Live Status
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {statusMessage}
                  </p>
                </Card>
              )}

              {/* Transcript */}
              <div className="bg-muted rounded-lg p-4 h-48 overflow-y-auto">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedSession?.transcript}
                </p>
              </div>
            </Card>
          </div>

          {/* Threat Assessment */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <div className="text-4xl font-bold text-red-500 mt-2">
                  {selectedSession?.riskScore || 0}%
                </div>
                <Badge className="mt-3 bg-red-500 text-white w-full justify-center">
                  CRITICAL THREAT
                </Badge>
              </div>

              {/* Risk Gauge */}
              <div className="space-y-3">
                {riskMetrics.map((metric, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {metric.label}
                      </span>
                      <span className={`font-semibold ${getSeverityColor(metric.severity).split(" ")[1]}`}>
                        {metric.value}
                      </span>
                    </div>
                    <div className={`h-2 rounded-full ${getSeverityColor(metric.severity).split(" ")[0]}`} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Caller Info */}
            <Card className="p-6">
              <p className="text-sm font-medium text-foreground mb-4">Caller Information</p>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs text-red-900 font-medium">Caller ID</p>
                  <p className="text-sm font-mono text-red-800 mt-1">
                    {selectedSession?.callerId}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-900 font-medium">Recipient</p>
                  <p className="text-sm text-blue-800 mt-1">
                    {selectedSession?.recipientName}
                  </p>
                </div>
              </div>
            </Card>

            {activePipelineSession && <AIPipelinePanel session={activePipelineSession} compact />}

            {/* Detected Keywords */}
            <Card className="p-6">
              <p className="text-sm font-medium text-foreground mb-4">
                Threat Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSession?.keywords.map((keyword, idx) => (
                  <Badge
                    key={idx}
                    className={`text-xs ${getKeywordSeverity(keyword) === "critical"
                      ? "bg-red-100 text-red-800"
                      : "bg-orange-100 text-orange-800"
                      }`}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Sessions List */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Active Monitoring Sessions
          </h3>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={`p-4 border rounded-lg cursor-pointer smooth-transition ${selectedSession?.id === session.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="font-mono text-sm font-medium">
                        {session.callerId}
                      </span>
                      {session.governmentImpersonation && (
                        <Badge className="bg-red-500 text-white text-xs">
                          Gov Impersonation
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Recipient: {session.recipientName}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(session.duration)}
                      </span>
                      <span>{session.keywords.length} threat keywords</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-500">
                      {session.riskScore}%
                    </div>
                    <Badge
                      variant={
                        session.status === "ongoing"
                          ? "destructive"
                          : "secondary"
                      }
                      className="mt-2"
                    >
                      {session.status === "ongoing" ? "🔴 Live" : "⏹ Recorded"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Behavioral Timeline */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Behavioral Timeline
          </h3>
          <div className="space-y-4">
            {[
              {
                time: "00:00",
                event: "Call initiated",
                type: "event",
              },
              {
                time: "00:15",
                event: 'Impersonation detected: "Police Commissioner"',
                type: "threat",
              },
              {
                time: "02:30",
                event: "Psychological pressure applied - threat of arrest",
                type: "threat",
              },
              {
                time: "05:42",
                event: "Money demand initiated - ₹50,000 requested",
                type: "critical",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${item.type === "critical"
                      ? "bg-red-500"
                      : item.type === "threat"
                        ? "bg-orange-500"
                        : "bg-blue-500"
                      }`}
                  />
                  {idx < 3 && (
                    <div className="w-0.5 h-12 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-xs font-mono text-muted-foreground">
                    {item.time}
                  </p>
                  <p className="text-sm text-foreground mt-1">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Recommendations */}
        <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Immediate Actions Required
          </h3>
          <div className="space-y-3">
            {[
              "ALERT RECIPIENT: Victim may not be aware of the scam. Initiate call recording for evidence.",
              "FILE FIR: Register First Information Report under IPC 419 (Cheating by personation of public servant)",
              "TRACK CALLER: Monitor the phone number for pattern analysis and network mapping",
              "FREEZE ACCOUNTS: If money was transferred, immediately freeze recipient accounts",
              "NOTIFY BANKS: Alert recipient's bank to monitor for unusual transactions",
            ].map((action, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-white rounded border border-red-200">
                <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                <p className="text-sm text-foreground">{action}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </SatarkLayout>
  );
}
