import { SatarkLayout } from "@/components/SatarkLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { InvestigationService } from "@/services/investigationService";
import { useApp } from "@/context/AppContext";
import { AIPipelinePanel } from "@/components/AIPipelinePanel";
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  Eye,
  Zap,
  TrendingUp,
  FileText,
} from "lucide-react";

interface AnalysisResult {
  denomination: string;
  frontImageQuality: number;
  backImageQuality: number;
  securityThread: { detected: boolean; confidence: number };
  watermark: { detected: boolean; confidence: number };
  serialNumber: { detected: boolean; value: string };
  latentImage: { detected: boolean; confidence: number };
  textureAnalysis: number;
  colorConsistency: number;
  overallRiskScore: number;
  templateMatch: string;
}

const mockAnalysis: AnalysisResult = {
  denomination: "500 INR",
  frontImageQuality: 95,
  backImageQuality: 92,
  securityThread: { detected: true, confidence: 88 },
  watermark: { detected: true, confidence: 91 },
  serialNumber: { detected: true, value: "7A 234567" },
  latentImage: { detected: true, confidence: 85 },
  textureAnalysis: 87,
  colorConsistency: 89,
  overallRiskScore: 92,
  templateMatch: "RBI Template 2023 - 500 Rupee Note",
};

export default function CounterfeitDetection() {
  const { analysisSessions, getAnalysisSession } = useApp();
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisInvestigationId, setAnalysisInvestigationId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const activeSession = useMemo(
    () => analysisInvestigationId ? getAnalysisSession(analysisInvestigationId) : analysisSessions.find((session) => session.status !== "completed"),
    [analysisSessions, analysisInvestigationId, getAnalysisSession]
  );

  const handleImageUpload = (side: "front" | "back", file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (side === "front") {
        setFrontImage(result);
      } else {
        setBackImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!frontImage || !backImage) {
      setStatusMessage("Upload both the front and back note images to start analysis.");
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage("Evidence uploaded. Running currency analysis pipeline...");
    try {
      const result = await InvestigationService.analyzeCounterfeit({
        denomination: mockAnalysis.denomination,
        noteSummary: `Suspected counterfeit note analysis for ${mockAnalysis.denomination}. Security thread, watermark, serial number, texture, and color checks all completed.`,
        evidenceName: "Counterfeit_Note_Front_Back.jpg",
      });
      setAnalysisInvestigationId(result.investigation.id);
      setStatusMessage("AI pipeline is validating the evidence and fusing risk signals...");
      await new Promise((resolve) => setTimeout(resolve, 900));
      setAnalysisResult(mockAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 85) return "text-red-600";
    if (score > 60) return "text-orange-600";
    return "text-green-600";
  };

  const getRiskBg = (score: number) => {
    if (score > 85) return "bg-red-50 border-red-200";
    if (score > 60) return "bg-orange-50 border-orange-200";
    return "bg-green-50 border-green-200";
  };

  const FeatureAnalysis = ({
    name,
    detected,
    confidence,
  }: {
    name: string;
    detected: boolean;
    confidence: number;
  }) => (
    <div className="p-4 border border-border rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <p className="font-medium text-foreground text-sm">{name}</p>
        <Badge
          className={detected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
        >
          {detected ? "✓ Detected" : "✗ Missing"}
        </Badge>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Confidence</span>
          <span className="font-medium">{confidence}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full ${detected ? "bg-green-500" : "bg-red-500"
              }`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <SatarkLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Counterfeit Currency Detection
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced AI analysis for currency authentication & RBI verification
          </p>
        </div>

        {/* Upload Section */}
        {!analysisResult ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Front Image Upload */}
            <Card className="p-6">
              <p className="font-medium text-foreground mb-4">Upload Front Image</p>
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary smooth-transition"
                onClick={() =>
                  document.getElementById("front-input")?.click()
                }
              >
                {frontImage ? (
                  <div>
                    <img
                      src={frontImage}
                      alt="Front"
                      className="w-full h-40 object-cover rounded mb-4"
                    />
                    <p className="text-xs text-green-600 flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Image uploaded
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      Click to upload
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG up to 10MB
                    </p>
                  </div>
                )}
              </div>
              <input
                id="front-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload("front", file);
                }}
              />
            </Card>

            {/* Back Image Upload */}
            <Card className="p-6">
              <p className="font-medium text-foreground mb-4">Upload Back Image</p>
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary smooth-transition"
                onClick={() =>
                  document.getElementById("back-input")?.click()
                }
              >
                {backImage ? (
                  <div>
                    <img
                      src={backImage}
                      alt="Back"
                      className="w-full h-40 object-cover rounded mb-4"
                    />
                    <p className="text-xs text-green-600 flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Image uploaded
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      Click to upload
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG up to 10MB
                    </p>
                  </div>
                )}
              </div>
              <input
                id="back-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload("back", file);
                }}
              />
            </Card>
          </div>
        ) : null}

        {/* Analysis Button */}
        {!analysisResult && (
          <Button
            onClick={handleAnalyze}
            disabled={!frontImage || !backImage || isAnalyzing}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 h-12 text-base"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Currency"}
          </Button>
        )}

        {statusMessage && (
          <Card className="p-4 border-dashed border-border bg-muted/20">
            <p className="text-xs font-medium text-muted-foreground mb-2">Live Status</p>
            <p className="text-sm text-foreground">{statusMessage}</p>
          </Card>
        )}

        {activeSession && (
          <AIPipelinePanel session={activeSession} />
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card
              className={`p-8 border-2 ${getRiskBg(analysisResult.overallRiskScore)}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Denomination</p>
                  <h3 className="text-3xl font-bold text-foreground">
                    {analysisResult.denomination}
                  </h3>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Overall Risk</p>
                  <h3
                    className={`text-3xl font-bold ${getRiskColor(
                      analysisResult.overallRiskScore
                    )}`}
                  >
                    {analysisResult.overallRiskScore}%
                  </h3>
                  <Badge
                    className={
                      analysisResult.overallRiskScore > 85
                        ? "mt-3 bg-red-500 text-white"
                        : analysisResult.overallRiskScore > 60
                          ? "mt-3 bg-orange-500 text-white"
                          : "mt-3 bg-green-500 text-white"
                    }
                  >
                    {analysisResult.overallRiskScore > 85
                      ? "COUNTERFEIT"
                      : analysisResult.overallRiskScore > 60
                        ? "SUSPICIOUS"
                        : "AUTHENTIC"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">RBI Match</p>
                  <p className="text-sm font-medium text-foreground">
                    {analysisResult.templateMatch}
                  </p>
                </div>
              </div>
            </Card>

            {/* Image Comparison */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Image Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Front Image Quality: {analysisResult.frontImageQuality}%
                  </p>
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{
                        width: `${analysisResult.frontImageQuality}%`,
                      }}
                    />
                  </div>
                  {frontImage && (
                    <img
                      src={frontImage}
                      alt="Front"
                      className="w-full h-48 object-cover rounded"
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Back Image Quality: {analysisResult.backImageQuality}%
                  </p>
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{
                        width: `${analysisResult.backImageQuality}%`,
                      }}
                    />
                  </div>
                  {backImage && (
                    <img
                      src={backImage}
                      alt="Back"
                      className="w-full h-48 object-cover rounded"
                    />
                  )}
                </div>
              </div>
            </Card>

            {/* Security Features */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Security Feature Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureAnalysis
                  name="Security Thread"
                  detected={analysisResult.securityThread.detected}
                  confidence={analysisResult.securityThread.confidence}
                />
                <FeatureAnalysis
                  name="Watermark"
                  detected={analysisResult.watermark.detected}
                  confidence={analysisResult.watermark.confidence}
                />
                <FeatureAnalysis
                  name="Latent Image"
                  detected={analysisResult.latentImage.detected}
                  confidence={analysisResult.latentImage.confidence}
                />
                <div className="p-4 border border-border rounded-lg">
                  <p className="font-medium text-foreground text-sm mb-3">
                    Serial Number (OCR)
                  </p>
                  <div className="bg-muted rounded p-3">
                    <p className="font-mono text-foreground font-bold">
                      {analysisResult.serialNumber.value}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Detailed Analysis */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Detailed Analysis Scores
              </h3>
              <div className="space-y-4">
                {[
                  {
                    name: "Texture Analysis",
                    score: analysisResult.textureAnalysis,
                  },
                  {
                    name: "Color Consistency",
                    score: analysisResult.colorConsistency,
                  },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">
                        {item.name}
                      </span>
                      <span className="font-bold text-primary">
                        {item.score}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-primary"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Explainability Panel */}
            <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Counterfeit Detection Analysis
              </h3>
              <div className="space-y-3 text-sm">
                <p className="text-foreground">
                  <strong>Finding:</strong> This currency shows{" "}
                  <span className="text-red-600 font-semibold">
                    HIGH LIKELIHOOD OF COUNTERFEIT
                  </span>{" "}
                  based on the following factors:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex gap-2">
                    <span className="text-red-600">•</span>
                    <span>
                      Security thread has inconsistent metallic properties
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600">•</span>
                    <span>Watermark clarity below RBI specifications</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-600">•</span>
                    <span>Microprint texture shows printing irregularities</span>
                  </li>
                </ul>
                <p className="text-foreground mt-4 pt-4 border-t border-red-200">
                  <strong>Recommendation:</strong> Report this to the nearest
                  police station and RBI. Do not attempt to spend these notes.
                </p>
              </div>
            </Card>

            {/* Generate Report */}
            <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 h-12 text-base">
              <FileText className="w-4 h-4 mr-2" />
              Generate Investigation Report
            </Button>

            {/* Reset Button */}
            <Button
              onClick={() => {
                setAnalysisResult(null);
                setFrontImage(null);
                setBackImage(null);
              }}
              variant="outline"
              className="w-full"
            >
              Analyze Another Note
            </Button>
          </div>
        )}
      </div>
    </SatarkLayout>
  );
}
