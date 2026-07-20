import { SatarkLayout } from "@/components/SatarkLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import {
  FolderOpen,
  FileText,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Search,
} from "lucide-react";

export default function CaseManagement() {
  const { investigations, getEvidenceByCase } = useApp();
  const [selectedCase, setSelectedCase] = useState(investigations[0]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCases = investigations.filter((inv) =>
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const evidence = selectedCase ? getEvidenceByCase(selectedCase.id) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "investigation":
        return "bg-purple-100 text-purple-800";
      case "closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <SatarkLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Case Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Centralized investigation tracking & evidence management
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cases List */}
          <div className="lg:col-span-1">
            <Card className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Active Cases ({filteredCases.length})
              </h3>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-white text-foreground placeholder-muted-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Cases List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredCases.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedCase(inv)}
                    className={`p-3 border rounded-lg cursor-pointer smooth-transition ${
                      selectedCase?.id === inv.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-mono text-xs font-bold text-foreground">
                      {inv.id}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {inv.type.replace(/_/g, " ")}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge className={`text-xs ${getRiskColor(inv.riskLevel)}`}>
                        {inv.riskLevel}
                      </Badge>
                      <Badge
                        className={`text-xs ${getStatusColor(inv.status)}`}
                      >
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Case Details */}
          {selectedCase && (
            <div className="lg:col-span-2 space-y-4">
              {/* Header Card */}
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {selectedCase.id}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {selectedCase.type.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={`${getRiskColor(selectedCase.riskLevel)}`}>
                      {selectedCase.riskLevel.toUpperCase()}
                    </Badge>
                    <Badge className={`${getStatusColor(selectedCase.status)}`}>
                      {selectedCase.status}
                    </Badge>
                  </div>
                </div>

                <p className="text-foreground mb-4">{selectedCase.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedCase.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Updated</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedCase.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                  {selectedCase.officer && (
                    <div>
                      <p className="text-xs text-muted-foreground">Officer</p>
                      <p className="text-sm font-medium text-foreground">
                        {selectedCase.officer}
                      </p>
                    </div>
                  )}
                  {selectedCase.location && (
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium text-foreground">
                        {selectedCase.location.city}, {selectedCase.location.state}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Complainant Info */}
              {selectedCase.citizenName && (
                <Card className="p-6">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Complainant Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-sm font-medium text-foreground">
                        {selectedCase.citizenName}
                      </p>
                    </div>
                    {selectedCase.phoneNumber && (
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-mono text-foreground">
                          {selectedCase.phoneNumber}
                        </p>
                      </div>
                    )}
                    {selectedCase.upiId && (
                      <div>
                        <p className="text-xs text-muted-foreground">UPI ID</p>
                        <p className="text-sm font-mono text-foreground">
                          {selectedCase.upiId}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Evidence */}
              <Card className="p-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Evidence ({evidence.length} items)
                </h3>
                {evidence.length > 0 ? (
                  <div className="space-y-2">
                    {evidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 border border-border rounded-lg hover:bg-muted/50 smooth-transition"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm text-foreground">
                              {ev.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {ev.type} • {(ev.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {ev.uploadedAt.toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No evidence uploaded yet
                  </p>
                )}
              </Card>

              {/* Timeline */}
              <Card className="p-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Investigation Timeline
                </h3>
                <div className="space-y-4">
                  {selectedCase.timeline.map((event, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            event.severity === "critical"
                              ? "bg-red-500"
                              : event.severity === "high"
                                ? "bg-orange-500"
                                : "bg-blue-500"
                          }`}
                        />
                        {idx < selectedCase.timeline.length - 1 && (
                          <div className="w-0.5 h-12 bg-border my-2" />
                        )}
                      </div>
                      <div className="pt-0.5 pb-4 flex-1">
                        <p className="text-xs font-mono text-muted-foreground">
                          {event.timestamp.toLocaleString()}
                        </p>
                        <p className="font-medium text-sm text-foreground mt-1">
                          {event.type.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Related Cases */}
              {selectedCase.relatedCases.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-bold text-foreground mb-4">
                    Related Cases
                  </h3>
                  <div className="space-y-2">
                    {selectedCase.relatedCases.map((relatedId, idx) => {
                      const relatedCase = investigations.find(
                        (inv) => inv.id === relatedId
                      );
                      return relatedCase ? (
                        <div
                          key={idx}
                          className="p-3 border border-border rounded-lg cursor-pointer hover:border-primary smooth-transition"
                          onClick={() => setSelectedCase(relatedCase)}
                        >
                          <p className="font-mono text-xs font-bold text-primary">
                            {relatedCase.id}
                          </p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </SatarkLayout>
  );
}
