import { SatarkLayout } from "@/components/SatarkLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { AIPipelinePanel } from "@/components/AIPipelinePanel";
import { InvestigationService } from "@/services/investigationService";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Send,
  Upload,
  Phone,
  QrCode,
  FileText,
  Mic,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  Zap,
  Clock,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  attachments?: { type: string; name: string }[];
}

interface CaseState {
  riskScore: number;
  scamType: string;
  matchedScams: string[];
  missingEvidence: string[];
  recommendedActions: string[];
}

export default function CitizenFraudShield() {
  const { createInvestigation, addEvidence, analysisSessions, getAnalysisSession } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Hello! I'm SATARK 360 Fraud Detection Assistant. I'm here to help you report and analyze potential fraud or scam activities. You can:\n\n• Describe what happened\n• Upload evidence (images, audio, video, PDF, QR codes)\n• Share phone numbers or UPI IDs\n• Ask for risk assessment\n\nLet's start - what brings you here today?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<{ type: string; name: string }[]>([]);
  const [caseState, setCaseState] = useState<CaseState>({
    riskScore: 0,
    scamType: "unknown",
    matchedScams: [],
    missingEvidence: [],
    recommendedActions: [],
  });

  const [showSidebar, setShowSidebar] = useState(true);
  const [submittedInvestigationId, setSubmittedInvestigationId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = useMemo(
    () => submittedInvestigationId ? getAnalysisSession(submittedInvestigationId) : analysisSessions.find((session) => session.status !== "completed"),
    [analysisSessions, getAnalysisSession, submittedInvestigationId]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userInput: string, attachmentCount: number) => {
    const responses: string[] = [];

    // Analyze content
    const lowerInput = userInput.toLowerCase();

    if (
      lowerInput.includes("arrest") ||
      lowerInput.includes("police") ||
      lowerInput.includes("commissioner")
    ) {
      responses.push(
        "Based on your description, this appears to be a **Digital Arrest Scam**. The scammer is impersonating law enforcement to create urgency and fear.\n\nDanger Signs I detected:\n• Threatening legal action\n• Demands for immediate payment\n• Impersonating government officials"
      );
      setCaseState((prev) => ({
        ...prev,
        scamType: "digital_arrest",
        riskScore: 92,
        matchedScams: [
          "Police Impersonation (2024)",
          "Digital Arrest Pattern - Mumbai Region",
          "Similar case: INV-2024-0001",
        ],
        missingEvidence: [
          "Call recording",
          "Caller ID information",
          "SMS/WhatsApp screenshots",
        ],
        recommendedActions: [
          "Do NOT send any money",
          "Block the number immediately",
          "File FIR with local police",
          "Enable call recording for future evidence",
        ],
      }));
    } else if (
      lowerInput.includes("upi") ||
      lowerInput.includes("bank") ||
      lowerInput.includes("transfer")
    ) {
      responses.push(
        "This sounds like **Banking Fraud / UPI Scam**. Scammers use fake payment links or social engineering to steal money.\n\nKey Warning Signs:\n• Unexpected payment requests\n• Urgency to complete transaction\n• Links from untrusted sources"
      );
      setCaseState((prev) => ({
        ...prev,
        scamType: "banking_fraud",
        riskScore: 85,
        matchedScams: ["UPI Fraud Network", "Phishing Attack Pattern"],
        missingEvidence: ["Transaction screenshots", "Payment link", "Sender details"],
        recommendedActions: [
          "Stop all transactions",
          "Report to your bank immediately",
          "Change banking passwords",
          "File cybercrime complaint online",
        ],
      }));
    } else if (
      lowerInput.includes("currency") ||
      lowerInput.includes("note") ||
      lowerInput.includes("cash")
    ) {
      responses.push(
        "You might have encountered **Counterfeit Currency**. Please upload images of the suspect notes for verification.\n\nI can analyze:\n• Security threads\n• Watermarks\n• Serial numbers\n• Texture and color consistency"
      );
      setCaseState((prev) => ({
        ...prev,
        scamType: "counterfeit",
        riskScore: 78,
        missingEvidence: ["High-resolution images of front", "High-resolution images of back"],
        recommendedActions: [
          "Do not spend the notes",
          "Store in safe place",
          "Upload images for analysis",
          "Report to nearest police station",
        ],
      }));
    } else {
      responses.push(
        "Thank you for sharing. I'm analyzing the information you provided.\n\nTo better assist you, I can:\n• Upload evidence files\n• Analyze risk factors\n• Search similar fraud cases\n• Generate investigation report"
      );
      setCaseState((prev) => ({
        ...prev,
        riskScore: 45,
      }));
    }

    if (attachmentCount > 0) {
      responses.push(
        `\n✓ I've received ${attachmentCount} evidence file(s). These are now part of your case and will be analyzed by our AI systems.`
      );
    }

    responses.push(
      "\n**Next Steps:**\n1. Provide more details if available\n2. Upload additional evidence\n3. Review risk assessment\n4. Click 'Submit Case' when ready to create official investigation"
    );

    return responses.join("\n");
  };

  const handleSendMessage = () => {
    if (!input.trim() && attachments.length === 0) return;

    // Add user message
    const userMessage: Message = {
      id: Math.random().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Get AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: Math.random().toString(),
        type: "ai",
        content: getAIResponse(input, attachments.length),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 500);

    setAttachments([]);
  };

  const handleFileUpload = (type: string) => {
    const newAttachment = {
      type,
      name: `file_${Date.now()}.${type === "image" ? "jpg" : type === "audio" ? "wav" : type === "video" ? "mp4" : type}`,
    };
    setAttachments((prev) => [...prev, newAttachment]);
  };

  const handleSubmitCase = async () => {
    if (caseState.riskScore === 0) {
      setStatusMessage("Describe the issue first so the AI pipeline can start.");
      return;
    }

    setStatusMessage("Creating investigation and starting AI pipeline...");
    const investigation = await createInvestigation({
      type: caseState.scamType as any,
      status: "active",
      riskLevel:
        caseState.riskScore > 90
          ? "critical"
          : caseState.riskScore > 70
            ? "high"
            : "medium",
      title: "Citizen Fraud Complaint",
      citizenName: "Anonymous Citizen",
      description: messages
        .filter((m) => m.type === "user")
        .map((m) => m.content)
        .join(" "),
    });

    setSubmittedInvestigationId(investigation.id);

    // Add evidence to the created case
    await Promise.all(
      attachments.map((att) =>
        addEvidence(investigation.id, {
          type: att.type as any,
          name: att.name,
          size: Math.floor(Math.random() * 5000000) + 100000,
        })
      )
    );

    setStatusMessage(`Investigation ${investigation.id} is now running through the AI pipeline.`);
  };

  return (
    <SatarkLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-6 md:px-8 py-6 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Fraud Detection Assistant
              </h1>
              <p className="text-muted-foreground mt-2">
                AI-powered fraud analysis & investigation support
              </p>
            </div>
            <Button
              onClick={() => setShowSidebar(!showSidebar)}
              variant="outline"
              className="hidden lg:block"
            >
              {showSidebar ? "Hide" : "Show"} Analysis
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 p-6 md:p-8 overflow-hidden">
          {/* Chat Section */}
          <div className="flex-1 flex flex-col bg-white rounded-xl border border-border overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xl ${msg.type === "user"
                      ? "bg-gradient-to-r from-primary to-secondary text-white rounded-2xl rounded-tr-none"
                      : "bg-muted rounded-2xl rounded-tl-none"
                      } p-4`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {msg.attachments.map((att, idx) => (
                          <div
                            key={idx}
                            className={`text-xs p-2 rounded flex items-center gap-2 ${msg.type === "user"
                              ? "bg-white/20"
                              : "bg-white/50"
                              }`}
                          >
                            <Upload className="w-3 h-3" />
                            {att.name}
                          </div>
                        ))}
                      </div>
                    )}

                    <p
                      className={`text-xs mt-2 opacity-70 ${msg.type === "user" ? "text-white" : "text-muted-foreground"
                        }`}
                    >
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachments Display */}
            {attachments.length > 0 && (
              <div className="px-6 py-3 border-t border-border bg-muted/30">
                <div className="flex flex-wrap gap-2">
                  {attachments.map((att, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      <Upload className="w-3 h-3 mr-1" />
                      {att.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-6 border-t border-border space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                  <input
                    type="text"
                    placeholder="Describe the fraud or upload evidence..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30"
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleFileUpload("image")}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <ImageIcon className="w-3 h-3 mr-1" />
                  Image
                </Button>
                <Button
                  onClick={() => handleFileUpload("audio")}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Mic className="w-3 h-3 mr-1" />
                  Audio
                </Button>
                <Button
                  onClick={() => handleFileUpload("video")}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Video
                </Button>
                <Button
                  onClick={() => handleFileUpload("pdf")}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  PDF
                </Button>
                <Button
                  onClick={() => handleFileUpload("qr")}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <QrCode className="w-3 h-3 mr-1" />
                  QR
                </Button>
              </div>
            </div>
          </div>

          {/* Analysis Sidebar */}
          {showSidebar && (
            <div className="hidden lg:flex lg:w-80 flex-col gap-4">
              <AIPipelinePanel session={activeSession} compact />

              {statusMessage && (
                <Card className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Live Status
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {statusMessage}
                  </p>
                </Card>
              )}

              {/* Risk Score */}
              <Card className="p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Risk Score
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-foreground">
                      {caseState.riskScore}%
                    </h3>
                    <Badge
                      variant={
                        caseState.riskScore > 80
                          ? "destructive"
                          : caseState.riskScore > 50
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {caseState.riskScore > 80
                        ? "Critical"
                        : caseState.riskScore > 50
                          ? "High"
                          : "Medium"}
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${caseState.riskScore > 80
                      ? "bg-red-500"
                      : caseState.riskScore > 50
                        ? "bg-orange-500"
                        : "bg-blue-500"
                      }`}
                    style={{ width: `${caseState.riskScore}%` }}
                  />
                </div>
              </Card>

              {/* Matched Scams */}
              {caseState.matchedScams.length > 0 && (
                <Card className="p-4">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Matched Scam Patterns
                  </p>
                  <div className="space-y-2">
                    {caseState.matchedScams.map((scam, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-900 flex gap-2"
                      >
                        <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        {scam}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Missing Evidence */}
              {caseState.missingEvidence.length > 0 && (
                <Card className="p-4">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Missing Evidence
                  </p>
                  <div className="space-y-2">
                    {caseState.missingEvidence.map((ev, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex gap-2"
                      >
                        <Clock className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        {ev}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recommended Actions */}
              {caseState.recommendedActions.length > 0 && (
                <Card className="p-4">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Recommended Actions
                  </p>
                  <div className="space-y-2">
                    {caseState.recommendedActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-900 flex gap-2"
                      >
                        <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        {action}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Submit Case */}
              {caseState.riskScore > 0 && (
                <Button
                  onClick={handleSubmitCase}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Submit Case
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </SatarkLayout>
  );
}
