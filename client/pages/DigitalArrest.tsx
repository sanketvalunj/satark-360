import { SatarkLayout } from "@/components/SatarkLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { useState, useEffect, useMemo, useRef } from "react";
import { InvestigationService } from "@/services/investigationService";
import { AIPipelinePanel } from "@/components/AIPipelinePanel";
import {
  Phone,
  Pause,
  Play,
  Volume2,
  AlertTriangle,
  Eye,
  Clock,
  CheckCircle,
  Mic,
  MicOff,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

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
  lastCue: string;
  threatCategory: string;
  explanation: string;
  confidence: number;
  speechRate: number;
  transcriptLength: number;
  detectedKeywords: string[];
  listeningDuration: number;
}

interface TimelineEvent {
  time: string;
  label: string;
  detail: string;
  change: number;
  risk: number;
  type: "keyword" | "category" | "risk";
}

interface ScamPhraseRule {
  keyword: string;
  category: string;
  weight: number;
  reason: string;
}

const SCAM_PHRASES: ScamPhraseRule[] = [
  { keyword: "Digital Arrest", category: "Digital Arrest", weight: 25, reason: "Frequently used by impersonators pretending to be police agencies." },
  { keyword: "Cyber Crime", category: "Government Impersonation", weight: 15, reason: "Used to create urgency around fake investigations." },
  { keyword: "Police", category: "Police Impersonation", weight: 15, reason: "Commonly used to impersonate law enforcement." },
  { keyword: "CBI", category: "Government Impersonation", weight: 15, reason: "Signals an impersonation attempt involving federal agencies." },
  { keyword: "Crime Branch", category: "Digital Arrest", weight: 15, reason: "A strong cue for coercive law-enforcement impersonation." },
  { keyword: "Income Tax", category: "Income Tax Scam", weight: 12, reason: "Often paired with fake tax enforcement pressure." },
  { keyword: "Customs", category: "Government Impersonation", weight: 10, reason: "Used to imply border or customs enforcement." },
  { keyword: "Money Laundering", category: "Digital Arrest", weight: 20, reason: "A classic trigger for coercive arrest-style frauds." },
  { keyword: "Drug Parcel", category: "Parcel Scam", weight: 14, reason: "Threatens the victim with fabricated parcel evidence." },
  { keyword: "Courier", category: "Parcel Scam", weight: 10, reason: "Often used in fake parcel or courier investigations." },
  { keyword: "OTP", category: "OTP Scam", weight: 15, reason: "Requests for one-time passwords are a common scam signal." },
  { keyword: "KYC", category: "KYC Scam", weight: 12, reason: "Used to pressure victims into sharing sensitive verification details." },
  { keyword: "PAN", category: "KYC Scam", weight: 10, reason: "A strong cue for identity verification fraud." },
  { keyword: "Aadhaar", category: "KYC Scam", weight: 10, reason: "Sensitive identity details are commonly exploited in scams." },
  { keyword: "Freeze Account", category: "Bank Fraud", weight: 15, reason: "Bank account threats are frequently used to create panic." },
  { keyword: "Bank Verification", category: "Bank Fraud", weight: 10, reason: "Impersonators request confidential banking data." },
  { keyword: "Video Verification", category: "Remote Access Scam", weight: 12, reason: "Commonly used to lure victims into remote sessions." },
  { keyword: "Court Order", category: "Digital Arrest", weight: 15, reason: "Suggests fake judiciary pressure." },
  { keyword: "Don't Disconnect", category: "Digital Arrest", weight: 15, reason: "A coercive phrase used to trap the victim in a scam call." },
  { keyword: "Immediate Transfer", category: "Bank Fraud", weight: 20, reason: "A direct request to move funds is highly suspicious." },
  { keyword: "Transfer Money", category: "Bank Fraud", weight: 20, reason: "A direct request to move funds is highly suspicious." },
  { keyword: "Immediate Payment", category: "Bank Fraud", weight: 15, reason: "Pressure tactics are often paired with money demands." },
  { keyword: "Bitcoin", category: "Crypto Scam", weight: 12, reason: "Criminals often request crypto transfers to avoid detection." },
  { keyword: "Crypto", category: "Crypto Scam", weight: 12, reason: "Used to redirect victims toward untraceable payment methods." },
  { keyword: "Gift Card", category: "OTP Scam", weight: 10, reason: "Gift cards are commonly used in fraud payments." },
  { keyword: "Remote Access", category: "Remote Access Scam", weight: 15, reason: "Suggests a request to take control of the victim’s device." },
  { keyword: "AnyDesk", category: "Remote Access Scam", weight: 15, reason: "Remote desktop software is often requested by scammers." },
  { keyword: "TeamViewer", category: "Remote Access Scam", weight: 15, reason: "Remote desktop software is often requested by scammers." },
  { keyword: "Screen Sharing", category: "Remote Access Scam", weight: 14, reason: "Screen sharing can be used to harvest credentials." },
  { keyword: "Google Meet Verification", category: "Remote Access Scam", weight: 12, reason: "Fraudsters impersonate support teams using video verification." },
  { keyword: "Skype Verification", category: "Remote Access Scam", weight: 12, reason: "Fraudsters impersonate support teams using video verification." },
  { keyword: "Suspicious Transaction", category: "Bank Fraud", weight: 14, reason: "A common phrase used during financial fraud pressure." },
  { keyword: "SIM Blocking", category: "Bank Fraud", weight: 10, reason: "Used to create panic around account access." },
  { keyword: "Account Suspension", category: "Bank Fraud", weight: 10, reason: "Used to create urgency around account control." },
  { keyword: "Your Aadhaar is linked", category: "KYC Scam", weight: 16, reason: "Leverages identity details to trigger fear." },
  { keyword: "Your bank account is frozen", category: "Bank Fraud", weight: 16, reason: "A highly coercive phrase used to push urgent payments." },
  { keyword: "Arrest Warrant", category: "Digital Arrest", weight: 16, reason: "A direct indicator of coercive arrest-style impersonation." },
  { keyword: "National Security", category: "Government Impersonation", weight: 15, reason: "Exploit fear by invoking national security concerns." },
  { keyword: "Confidential Investigation", category: "Government Impersonation", weight: 10, reason: "Used to impersonate lawful investigations." },
];

export default function DigitalArrest() {
  const { analysisSessions, getAnalysisSession } = useApp();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMonitoringRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [activeSessions, setActiveSessions] = useState<CallSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<CallSession | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Waiting for analysis");
  const [subtitle, setSubtitle] = useState("Start monitoring to begin the live review.");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [analysisInvestigationId, setAnalysisInvestigationId] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [investigationSummary, setInvestigationSummary] = useState<null | {
    threatCategory: string;
    threatScore: number;
    confidence: number;
    detectedIndicators: string[];
    shortSummary: string;
    recommendedAction: string;
  }>(null);

  const activePipelineSession = useMemo(
    () =>
      analysisInvestigationId
        ? getAnalysisSession(analysisInvestigationId)
        : analysisSessions.find((session) => session.status !== "completed"),
    [analysisInvestigationId, analysisSessions, getAnalysisSession]
  );

  useEffect(() => {
    const initialSession: CallSession = {
      id: "SESSION-001",
      callerId: "+91-9988776655",
      recipientName: "Rajesh Kumar",
      duration: 0,
      startTime: new Date(),
      keywords: [],
      riskScore: 0,
      status: "ongoing",
      transcript: "",
      governmentImpersonation: false,
      lastCue: "Waiting for the first suspicious phrase.",
      threatCategory: "Monitoring",
      explanation: "Listening for live scam cues and impersonation patterns.",
      confidence: 0,
      speechRate: 0,
      transcriptLength: 0,
      detectedKeywords: [],
      listeningDuration: 0,
    };

    setActiveSessions([initialSession]);
    setSelectedSession(initialSession);
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      recognitionRef.current?.stop();
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = window.setInterval(() => {
      setSelectedSession((prev) => {
        if (!prev) return prev;
        const nextDuration = prev.duration + 1;
        return { ...prev, duration: nextDuration, listeningDuration: nextDuration };
      });
      setActiveSessions((prev) => {
        if (!prev[0]) return prev;
        return [{ ...prev[0], duration: prev[0].duration + 1, listeningDuration: prev[0].listeningDuration + 1 }];
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isMonitoring]);

  useEffect(() => {
    isMonitoringRef.current = isMonitoring;
  }, [isMonitoring]);

  const playWarningTone = () => {
    if (typeof window === "undefined") return;
    if (typeof window.AudioContext === "undefined" && typeof (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext === "undefined") return;

    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    gain.gain.setValueAtTime(0.14, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.35);
  };

  const updateSessionState = (patch: Partial<CallSession>) => {
    setSelectedSession((prev) => (prev ? { ...prev, ...patch } : prev));
    setActiveSessions((prev) => (prev[0] ? [{ ...prev[0], ...patch }] : prev));
  };

  const analyzeTranscript = (text: string) => {
    const normalized = text.toLowerCase();
    const matchedRules = SCAM_PHRASES.filter((rule) => normalized.includes(rule.keyword.toLowerCase()));

    if (!matchedRules.length) return;

    const category = matchedRules[0].category;
    const reasons = matchedRules[0].reason;
    const matchedKeywords = matchedRules.map((rule) => rule.keyword);

    setSelectedSession((prev) => {
      if (!prev) return prev;
      const baseContribution = matchedRules.reduce((sum, rule) => sum + rule.weight, 0);
      const highRiskSignalCount = matchedRules.filter((rule) => rule.weight >= 15).length;
      const hasGovernmentImpersonation = matchedRules.some((rule) => /police|cbi|crime branch|cyber crime|national security|court order|confidential investigation/i.test(rule.keyword));
      const hasFinancialCoercion = matchedRules.some((rule) => /money laundering|freeze account|transfer money|immediate|otp|payment|account|bank/i.test(rule.keyword));
      const hasAccountFreeze = matchedRules.some((rule) => /freeze account|account suspension|frozen/i.test(rule.keyword));
      const hasTransferRequest = matchedRules.some((rule) => /transfer money|immediate transfer|immediate payment|send money|payment/i.test(rule.keyword));
      const combinationBonus = (hasGovernmentImpersonation && hasFinancialCoercion ? 28 : 0)
        + (hasGovernmentImpersonation && hasAccountFreeze ? 22 : 0)
        + (hasGovernmentImpersonation && hasTransferRequest ? 24 : 0)
        + (hasFinancialCoercion && hasTransferRequest ? 14 : 0);
      const contribution = Math.min(100, baseContribution + highRiskSignalCount * 4 + combinationBonus);
      const previousRisk = prev.riskScore;
      const finalRisk = Math.min(100, Math.round(Math.max(contribution, previousRisk * 0.35 + contribution * 0.65)));
      const nextConfidence = Math.min(99, Math.max(70, Math.round(70 + matchedRules.length * 4 + highRiskSignalCount * 5 + contribution / 10 + (combinationBonus > 0 ? 8 : 0))));
      const nextTranscript = `${prev.transcript}${prev.transcript ? " " : ""}${text}`.trim();
      const words = nextTranscript.trim().split(/\s+/).filter(Boolean).length;
      const speechRate = Math.round(words / Math.max(1, (prev.listeningDuration || 1) / 60));
      const nextKeywords = Array.from(new Set([...prev.detectedKeywords, ...matchedKeywords]));
      const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const nextTimelineEvents: TimelineEvent[] = [];

      if (matchedKeywords.length) {
        const keywordLabel = hasGovernmentImpersonation
          ? "Government Impersonation Detected"
          : hasFinancialCoercion
            ? "Financial Coercion Detected"
            : "Scam Indicator Detected";
        const keywordDetail = matchedKeywords.slice(0, 3).join(", ");
        nextTimelineEvents.push({
          time: currentTime,
          label: keywordLabel,
          detail: `Detected ${keywordDetail}${matchedKeywords.length > 3 ? " and more" : ""}`,
          change: contribution,
          risk: finalRisk,
          type: "keyword",
        });
      }

      if (category !== prev.threatCategory) {
        nextTimelineEvents.push({
          time: currentTime,
          label: "Threat Classified as Digital Arrest",
          detail: category,
          change: 0,
          risk: finalRisk,
          type: "category",
        });
      }

      if (Math.abs(finalRisk - previousRisk) >= 12) {
        nextTimelineEvents.push({
          time: currentTime,
          label: finalRisk > previousRisk ? `Risk Increased to ${finalRisk}%` : `Risk Reduced to ${finalRisk}%`,
          detail: finalRisk > previousRisk ? "The pattern now indicates a stronger scam signal." : "The signal weakened after the latest transcript segment.",
          change: finalRisk - previousRisk,
          risk: finalRisk,
          type: "risk",
        });
      }

      setTimeline((currentTimeline) => [...nextTimelineEvents, ...currentTimeline].slice(0, 8));

      if (finalRisk > 80) {
        navigator.vibrate?.(200);
        playWarningTone();
      }

      const nextSession: CallSession = {
        ...prev,
        riskScore: finalRisk,
        keywords: nextKeywords,
        transcript: nextTranscript,
        lastCue: text,
        threatCategory: category,
        explanation: reasons,
        confidence: nextConfidence,
        speechRate,
        transcriptLength: nextTranscript.length,
        detectedKeywords: nextKeywords,
        listeningDuration: prev.listeningDuration,
      };

      updateSessionState(nextSession);

      return nextSession;
    });
  };

  const startSpeechRecognition = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setIsDemoMode(true);
      setStatusMessage("Speech recognition unavailable. Demo mode enabled.");
      setSubtitle("Demo mode active. A sample call is being reviewed.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event: any) => {
      let interimText = "";
      let finalText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0].transcript.trim();
        if (result.isFinal) {
          finalText += `${transcript} `;
          analyzeTranscript(transcript);
        } else {
          interimText += `${transcript} `;
        }
      }

      const nextSubtitle = finalText.trim() || interimText.trim() || "Listening for suspicious language…";
      setSubtitle(nextSubtitle);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") {
        setIsDemoMode(true);
        setStatusMessage("Microphone permission was denied. Demo mode enabled.");
        setSubtitle("Permission blocked. Demo mode is active.");
      } else {
        setStatusMessage("Speech recognition paused. Reconnecting automatically.");
      }
    };

    recognition.onend = () => {
      if (isMonitoringRef.current && !stopRequestedRef.current) {
        window.setTimeout(() => {
          if (isMonitoringRef.current && !stopRequestedRef.current) {
            startSpeechRecognition();
          }
        }, 250);
      } else {
        setIsListening(false);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    setStatusMessage("Listening for suspicious phrases");
  };

  const startMonitoring = async () => {
    stopRequestedRef.current = false;
    setIsPreparing(true);
    setIsDemoMode(false);
    setSubtitle("Requesting microphone access…");
    setStatusMessage("Preparing live monitoring");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access is not available");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsMonitoring(true);
      setIsPreparing(false);
      setStatusMessage("Microphone ready. Waiting for speech.");
      setTimeline((currentTimeline) => [{
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        label: "Monitoring Started",
        detail: "Live monitoring activated for the incoming call.",
        change: 0,
        risk: 0,
        type: "category",
      }, ...currentTimeline].slice(0, 8));
      startSpeechRecognition();
    } catch {
      setIsMonitoring(true);
      setIsPreparing(false);
      setIsDemoMode(true);
      setSubtitle("Demo mode active. The browser is not providing live speech capture.");
      setStatusMessage("Microphone access blocked. Demo mode enabled.");
    }
  };

  const buildInvestigationSummary = (session: CallSession) => {
    const transcript = session.transcript || "";
    const combinedText = `${session.detectedKeywords.join(" ")} ${transcript}`.toLowerCase();
    const hasGovernment = /police|cbi|crime branch|cyber crime|court order|national security|confidential investigation/i.test(combinedText);
    const hasFinancial = /money laundering|freeze account|transfer money|immediate payment|payment|otp|bank|account/i.test(combinedText);
    const hasTransfer = /transfer money|immediate transfer|immediate payment|send money|payment/i.test(combinedText);
    const hasFreeze = /freeze account|account suspension|frozen/i.test(combinedText);
    const detectedIndicators = session.detectedKeywords.length ? session.detectedKeywords.slice(0, 6) : ["No scam indicators detected yet"];

    let shortSummary = "The call transcript contains suspicious pressure tactics and should be reviewed as a potential digital arrest attempt.";
    if (hasGovernment && hasTransfer) {
      shortSummary = "The caller used government impersonation and financial pressure to urge the victim to transfer money.";
    } else if (hasGovernment && hasFreeze) {
      shortSummary = "The caller used government impersonation and account-freeze threats to create urgency and fear.";
    } else if (hasGovernment) {
      shortSummary = "The caller used government-style language and coercive pressure to imitate a lawful enforcement action.";
    } else if (hasTransfer) {
      shortSummary = "The caller attempted to pressure the victim into transferring money.";
    } else if (hasFreeze) {
      shortSummary = "The caller threatened account suspension or freezing to create urgency.";
    } else if (detectedIndicators[0] !== "No scam indicators detected yet") {
      shortSummary = `The transcript included ${detectedIndicators.slice(0, 3).join(", ")} and resembled a suspicious scam pattern.`;
    }

    let recommendedAction = "Continue monitoring and preserve the transcript for review.";
    if (hasTransfer || hasFreeze) {
      recommendedAction = "Do not transfer money or share OTPs. Report the incident immediately to Cyber Helpline 1930.";
    } else if (session.riskScore > 70) {
      recommendedAction = "Avoid sharing personal details and report the interaction to Cyber Helpline 1930.";
    }

    return {
      threatCategory: session.threatCategory || "Monitoring",
      threatScore: session.riskScore,
      confidence: session.confidence,
      detectedIndicators,
      shortSummary,
      recommendedAction,
    };
  };

  const stopMonitoring = () => {
    stopRequestedRef.current = true;
    setIsMonitoring(false);
    setIsListening(false);
    setIsPreparing(false);
    setStatusMessage("Monitoring stopped");
    recognitionRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (selectedSession) {
      setInvestigationSummary(buildInvestigationSummary(selectedSession));
    }
  };

  const createInvestigationFromSession = async () => {
    if (!selectedSession) return;

    setIsCreatingCase(true);
    setStatusMessage("Generating investigation from the live transcript.");
    try {
      const result = await InvestigationService.analyzeDigitalArrest({
        callerId: selectedSession.callerId,
        recipientName: selectedSession.recipientName,
        transcript: selectedSession.transcript || "No transcript captured yet.",
        keywords: selectedSession.detectedKeywords.length ? selectedSession.detectedKeywords : ["digital arrest"],
      });
      setAnalysisInvestigationId(result.investigation.id);
      setStatusMessage("Investigation case generated successfully.");
    } catch {
      setStatusMessage("Investigation generation is unavailable right now.");
    } finally {
      setIsCreatingCase(false);
    }
  };

  const riskMeterClass = useMemo(() => {
    if (selectedSession && selectedSession.riskScore > 80) return "bg-red-500";
    if (selectedSession && selectedSession.riskScore > 60) return "bg-orange-500";
    return "bg-primary";
  }, [selectedSession]);

  const riskLabel = useMemo(() => {
    if (!selectedSession) return "Monitoring";
    if (selectedSession.riskScore > 80) return "Critical";
    if (selectedSession.riskScore > 60) return "High";
    if (selectedSession.riskScore > 40) return "Medium";
    if (selectedSession.riskScore > 20) return "Suspicious";
    return "Safe";
  }, [selectedSession]);

  const riskLevel = useMemo(() => {
    if (!selectedSession) return "safe";
    if (selectedSession.riskScore > 80) return "critical";
    if (selectedSession.riskScore > 60) return "high";
    if (selectedSession.riskScore > 40) return "medium";
    return "safe";
  }, [selectedSession]);

  const riskBadgeClass = selectedSession && selectedSession.riskScore > 80
    ? "bg-red-500 text-white animate-pulse"
    : selectedSession && selectedSession.riskScore > 60
      ? "bg-orange-500 text-white"
      : "bg-primary/10 text-primary";

  const voiceMetrics = useMemo(() => {
    if (!selectedSession) return [];
    const words = Math.max(1, selectedSession.transcript.trim().split(/\s+/).filter(Boolean).length);
    const wpm = Math.round(words / Math.max(1, selectedSession.listeningDuration / 60));
    return [
      { label: "Listening Duration", value: `${selectedSession.listeningDuration}s` },
      { label: "Transcript Length", value: `${selectedSession.transcriptLength}` },
      { label: "Detected Keywords", value: `${selectedSession.detectedKeywords.length}` },
      { label: "Confidence", value: `${selectedSession.confidence}%` },
      { label: "Words / Minute", value: `${wpm}` },
    ];
  }, [selectedSession]);

  const recommendations = useMemo(() => {
    if (!selectedSession) return [];
    if (selectedSession.threatCategory.includes("Digital Arrest") || selectedSession.threatCategory.includes("Government")) {
      return [
        "Disconnect immediately",
        "Never transfer money",
        "Never share OTP",
        "Verify from the official government website",
        "Call Cyber Helpline 1930",
      ];
    }
    if (selectedSession.threatCategory.includes("Bank") || selectedSession.threatCategory.includes("Remote")) {
      return [
        "Do not share account credentials",
        "Freeze the transaction path immediately",
        "Report the case to the cyber helpline",
      ];
    }
    return ["Stay calm", "Document the conversation", "Report suspicious activity"];
  }, [selectedSession]);

  const threatExplanation = useMemo(() => {
    if (!selectedSession) return "Listening for suspicious language.";

    const keywords = selectedSession.detectedKeywords;
    const transcript = selectedSession.transcript || "";
    const combinedText = `${keywords.join(" ")} ${transcript}`.toLowerCase();
    const hasGovernment = /police|cbi|crime branch|cyber crime|court order|national security|confidential investigation/i.test(combinedText);
    const hasFinancial = /money laundering|freeze account|transfer money|immediate payment|payment|otp|bank|account/i.test(combinedText);
    const hasLegalThreat = /court order|arrest warrant|police|cbi|crime branch|national security/i.test(combinedText);
    const hasTransfer = /transfer money|immediate transfer|immediate payment|send money|payment/i.test(combinedText);
    const hasFreeze = /freeze account|account suspension|frozen/i.test(combinedText);

    const threatTypes = [] as string[];
    if (hasGovernment) threatTypes.push("Government Impersonation");
    if (hasFinancial) threatTypes.push("Financial Coercion");
    if (hasLegalThreat) threatTypes.push("Legal Threat Framing");

    const typeSummary = threatTypes.slice(0, 2).join(" and ") || "suspicious pressure tactics";
    let reason = `The conversation contains multiple indicators of ${typeSummary}.`;

    if (hasTransfer) {
      reason += " The caller attempted to pressure the victim into transferring money by claiming legal action.";
    } else if (hasFreeze) {
      reason += " The caller attempted to pressure the victim by threatening account suspension or freezing.";
    } else if (hasLegalThreat) {
      reason += " The caller used legal or enforcement language to create urgency and fear.";
    }

    reason += " This pattern closely matches known Digital Arrest scams.";
    return reason;
  }, [selectedSession]);

  const threatRecommendation = useMemo(() => {
    if (!selectedSession) return "Continue monitoring and document the interaction.";

    const transcript = selectedSession.transcript || "";
    const combinedText = `${selectedSession.detectedKeywords.join(" ")} ${transcript}`.toLowerCase();
    const hasTransfer = /transfer money|immediate transfer|immediate payment|send money|payment/i.test(combinedText);
    const hasFreeze = /freeze account|account suspension|frozen/i.test(combinedText);

    if (hasTransfer || hasFreeze) {
      return "Do not transfer money or share OTPs. Report the incident immediately to Cyber Helpline 1930.";
    }

    if (selectedSession.riskScore > 70) {
      return "Avoid sharing personal details and report the interaction to Cyber Helpline 1930.";
    }

    return "Continue monitoring and preserve the transcript for review.";
  }, [selectedSession]);

  const threatIndicators = useMemo(() => {
    if (!selectedSession?.detectedKeywords.length) return ["No indicators detected yet"];
    return selectedSession.detectedKeywords.slice(0, 6);
  }, [selectedSession]);

  const highlightedTranscript = useMemo(() => {
    if (!selectedSession?.transcript) return null;
    const keywords = selectedSession.detectedKeywords.length ? selectedSession.detectedKeywords : ["Digital Arrest"];
    const pattern = new RegExp(`(${keywords.map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    const parts = selectedSession.transcript.split(pattern);
    return parts.map((part, index) => {
      if (!part) return null;
      const isHighlight = keywords.some((keyword) => keyword.toLowerCase() === part.toLowerCase());
      return (
        <span key={`${part}-${index}`} className={isHighlight ? "rounded bg-red-100 px-1 py-0.5 text-red-800" : ""}>
          {part}
        </span>
      );
    });
  }, [selectedSession]);

  return (
    <SatarkLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Digital Arrest Detection</h1>
          <p className="text-muted-foreground mt-2">Real-time detection for suspicious digital arrest calls.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Live Monitoring</h2>
                  <p className="text-sm text-muted-foreground">Use the browser microphone to detect scam language live.</p>
                </div>
                <Badge variant={isListening ? "destructive" : "secondary"}>
                  {isListening ? "● Listening" : isPreparing ? "Preparing" : isMonitoring ? "Live" : "Standby"}
                </Badge>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg aspect-video flex items-center justify-center text-slate-400 mb-6 overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),_transparent_65%)]" />
                  <div className="w-[280px] rounded-[2.25rem] border border-white/15 bg-slate-950/90 p-2 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.85)]">
                    <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-slate-950">
                      <div className="h-[500px] w-[280px] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 px-6 text-center">
                        <div className="text-center text-slate-300">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-slate-800/80 shadow-lg shadow-black/20">
                          <Phone className="h-7 w-7 text-slate-100" />
                        </div>
                        <p className="text-sm font-medium text-white">Incoming Call Monitor</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-400">{isMonitoring ? "AI Monitoring Active" : "Press Start Monitoring"}</p>
                        {isMonitoring && (
                          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-emerald-400">
                            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                            Listening
                          </div>
                        )}
                      </div>
                      </div>
                      <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-black/60 p-3 backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-2">
                          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">AI Monitoring Active</p>
                        </div>
                      </div>
                      <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[11px] font-medium tracking-[0.2em] text-slate-200 uppercase">
                        {isDemoMode ? "Demo mode" : "Live call"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <Button onClick={startMonitoring} disabled={isPreparing || isMonitoring} className="flex items-center gap-2">
                  {isPreparing ? <Play className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isPreparing ? "Preparing..." : "Start Monitoring"}
                </Button>
                <Button variant="outline" onClick={stopMonitoring} disabled={!isMonitoring} className="flex items-center gap-2">
                  <MicOff className="w-4 h-4" />
                  Stop Monitoring
                </Button>
                <Button variant="outline" onClick={() => setShowTranscript((prev) => !prev)}>
                  <Eye className="w-4 h-4 mr-2" />
                  {showTranscript ? "Hide Transcript" : "View Full Transcript"}
                </Button>
              </div>

              {statusMessage && (
                <Card className="mb-6 p-4 border-dashed border-border bg-muted/20">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Live Status</p>
                  <p className="text-sm text-foreground leading-relaxed">{statusMessage}</p>
                </Card>
              )}

              {selectedSession && selectedSession.riskScore > 70 && (
                <div className="mb-6 rounded-lg border border-amber-300/80 bg-amber-50/90 p-3 text-amber-900 shadow-sm transition-all duration-500 ease-in-out">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold">🚨 HIGH RISK DIGITAL ARREST SCAM DETECTED</p>
                      <p className="mt-1 text-sm text-amber-800">Government impersonation suspected.</p>
                      <p className="mt-1 text-sm text-amber-800">Do NOT transfer money.</p>
                      <p className="mt-1 text-sm text-amber-800">Report immediately to Cyber Helpline 1930.</p>
                    </div>
                  </div>
                </div>
              )}

              {showTranscript && (
                <div className="bg-muted rounded-lg p-4 h-48 overflow-y-auto">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {highlightedTranscript || "No transcript yet. Start monitoring to capture live speech."}
                  </p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            {riskLevel !== "safe" && (
              <Card className={riskLevel === "critical" ? "border-red-300 bg-red-50 p-4" : "border-amber-300 bg-amber-50 p-4"}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={riskLevel === "critical" ? "mt-0.5 h-5 w-5 text-red-600" : "mt-0.5 h-5 w-5 text-amber-600"} />
                  <div>
                    <p className={riskLevel === "critical" ? "text-sm font-semibold text-red-900" : "text-sm font-semibold text-amber-900"}>
                      {riskLevel === "critical" ? "CRITICAL THREAT" : "HIGH RISK ACTIVITY"}
                    </p>
                    <p className={riskLevel === "critical" ? "mt-1 text-sm text-red-800" : "mt-1 text-sm text-amber-800"}>
                      {riskLevel === "critical"
                        ? "The caller is using coercive arrest-style language and should be treated as an active threat."
                        : "The conversation contains strong scam cues that require immediate caution."}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="text-4xl font-bold text-primary mt-2">{selectedSession?.riskScore || 0}%</div>
                <Badge className={`mt-3 w-full justify-center ${riskBadgeClass}`}>
                  {selectedSession?.riskScore && selectedSession.riskScore > 80 ? "HIGH RISK DIGITAL ARREST SCAM" : selectedSession?.riskScore && selectedSession.riskScore > 60 ? "Potential Scam Detected" : riskLabel}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Risk Meter</span>
                    <span className="font-semibold text-foreground">{selectedSession?.riskScore || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${riskMeterClass}`} style={{ width: `${Math.min(100, selectedSession?.riskScore || 0)}%` }} />
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Caller</span>
                    <span className="font-medium text-foreground">{selectedSession?.callerId}</span>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-muted-foreground">Investigation Timeline</span>
                    <span className="font-medium text-foreground">{timeline.length ? `${timeline.length} events` : "No events yet"}</span>
                  </div>
                  <div className="space-y-2">
                    {timeline.length ? timeline.map((item, idx) => (
                      <div key={`${item.label}-${idx}`} className="rounded border border-border/70 bg-background/70 px-2 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-medium text-foreground">{item.label}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{item.time}</p>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">{item.detail}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">Risk {item.risk}% • {item.type}</p>
                      </div>
                    )) : (
                      <p className="text-[11px] text-muted-foreground">New investigation activity will appear here as threats are detected.</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <p className="text-sm font-medium text-foreground mb-4">Caller Information</p>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs text-red-900 font-medium">Caller ID</p>
                  <p className="text-sm font-mono text-red-800 mt-1">{selectedSession?.callerId}</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-900 font-medium">Recipient</p>
                  <p className="text-sm text-blue-800 mt-1">{selectedSession?.recipientName}</p>
                </div>
              </div>
            </Card>

            {activePipelineSession && <AIPipelinePanel session={activePipelineSession} compact />}

            <Card className="p-6">
              <p className="text-sm font-medium text-foreground mb-4">Threat Analysis</p>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 rounded border border-border bg-muted/20 px-3 py-2">
                  <span className="text-muted-foreground">Threat Category</span>
                  <span className="font-semibold text-foreground">{selectedSession?.threatCategory || "Monitoring"}</span>
                </div>
                <div className="rounded border border-border bg-muted/20 px-3 py-2">
                  <div className="mb-2 text-muted-foreground">Detected Indicators</div>
                  <div className="flex flex-wrap gap-2">
                    {threatIndicators.map((indicator) => (
                      <span key={indicator} className="rounded-full border border-primary/20 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 rounded border border-border bg-muted/20 px-3 py-2">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-semibold text-foreground">{selectedSession?.confidence || 0}%</span>
                </div>
                <div className="rounded border border-border bg-muted/20 px-3 py-2">
                  <div className="mb-2 text-muted-foreground">Reason</div>
                  <p className="text-sm font-semibold leading-6 text-foreground">{threatExplanation}</p>
                </div>
                <div className="rounded border border-border bg-muted/20 px-3 py-2">
                  <div className="mb-2 text-muted-foreground">Recommendation</div>
                  <p className="text-sm font-semibold leading-6 text-foreground">{threatRecommendation}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <p className="text-sm font-medium text-foreground mb-4">Voice Analytics</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {voiceMetrics.map((metric) => (
                  <div key={metric.label} className="rounded border border-border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{metric.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            {investigationSummary && (
              <Card className="p-6">
                <p className="text-sm font-medium text-foreground mb-4">Investigation Summary</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-3 rounded border border-border bg-muted/20 px-3 py-2">
                    <span className="text-muted-foreground">Threat Category</span>
                    <span className="font-semibold text-foreground">{investigationSummary.threatCategory}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 rounded border border-border bg-muted/20 px-3 py-2">
                    <span className="text-muted-foreground">Threat Score</span>
                    <span className="font-semibold text-foreground">{investigationSummary.threatScore}%</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 rounded border border-border bg-muted/20 px-3 py-2">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-semibold text-foreground">{investigationSummary.confidence}%</span>
                  </div>
                  <div className="rounded border border-border bg-muted/20 px-3 py-2">
                    <div className="mb-2 text-muted-foreground">Detected Scam Indicators</div>
                    <div className="flex flex-wrap gap-2">
                      {investigationSummary.detectedIndicators.map((indicator) => (
                        <span key={indicator} className="rounded-full border border-primary/20 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-3 rounded border border-border bg-muted/20 px-3 py-2">
                    <span className="text-muted-foreground">Short Investigation Summary</span>
                    <span className="max-w-[60%] text-right font-semibold text-foreground">{investigationSummary.shortSummary}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 rounded border border-border bg-muted/20 px-3 py-2">
                    <span className="text-muted-foreground">Recommended Action</span>
                    <span className="max-w-[60%] text-right font-semibold text-foreground">{investigationSummary.recommendedAction}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Behavioral Timeline</h3>
          <div className="space-y-4">
            {timeline.length ? timeline.map((item, idx) => (
              <div key={`${item.label}-${idx}`} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${item.risk > 80 ? "bg-red-500" : item.risk > 60 ? "bg-orange-500" : "bg-blue-500"}`} />
                  {idx < timeline.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-xs font-mono text-muted-foreground">{item.time}</p>
                  <p className="text-sm text-foreground mt-1">{item.label} +{item.change}</p>
                  <p className="text-xs text-muted-foreground mt-1">Risk {item.risk}%</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">Waiting for the first scam cue.</p>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((action, idx) => (
              <div key={`${action}-${idx}`} className="flex gap-3 p-3 bg-white rounded border border-primary/20">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                <p className="text-sm text-foreground">{action}</p>
              </div>
            ))}
          </div>
        </Card>

        {selectedSession && selectedSession.riskScore > 80 && (
          <Card className="p-5 border-amber-200 bg-amber-50">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">⚠ HIGH RISK DIGITAL ARREST SCAM</p>
                  <p className="mt-1 text-sm text-amber-800">Do not transfer money. Report immediately.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={createInvestigationFromSession} disabled={isCreatingCase}>
                  {isCreatingCase ? "Preparing..." : "Generate Investigation"}
                </Button>
                <Button variant="outline" onClick={() => setStatusMessage("Evidence saved for the live review.")}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Save Evidence
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </SatarkLayout>
  );
}
