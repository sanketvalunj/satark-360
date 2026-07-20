import { SatarkLayout } from "@/components/SatarkLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import {
  User,
  Phone,
  CreditCard,
  Smartphone,
  MapPin,
  Bank,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function FraudNetwork() {
  const { graphNodes, graphEdges } = useApp();
  const [selectedNode, setSelectedNode] = useState(graphNodes[0]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "person":
        return <User className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "upi":
        return <CreditCard className="w-4 h-4" />;
      case "device":
        return <Smartphone className="w-4 h-4" />;
      case "location":
        return <MapPin className="w-4 h-4" />;
      case "bank":
        return <Bank className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getNodeColor = (type: string) => {
    const colors: Record<string, string> = {
      person: "bg-blue-100 text-blue-800",
      phone: "bg-red-100 text-red-800",
      upi: "bg-orange-100 text-orange-800",
      device: "bg-purple-100 text-purple-800",
      location: "bg-green-100 text-green-800",
      bank: "bg-yellow-100 text-yellow-800",
      complaint: "bg-pink-100 text-pink-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getConnectedNodes = (nodeId: string) => {
    const connected = new Set<string>();
    graphEdges.forEach((edge) => {
      if (edge.source === nodeId) connected.add(edge.target);
      if (edge.target === nodeId) connected.add(edge.source);
    });
    return Array.from(connected)
      .map((id) => graphNodes.find((n) => n.id === id))
      .filter(Boolean) as typeof graphNodes;
  };

  const getConnections = (nodeId: string) => {
    return graphEdges.filter((e) => e.source === nodeId || e.target === nodeId);
  };

  const connectedNodes = selectedNode ? getConnectedNodes(selectedNode.id) : [];
  const connections = selectedNode ? getConnections(selectedNode.id) : [];

  return (
    <SatarkLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Fraud Network Intelligence
          </h1>
          <p className="text-muted-foreground mt-2">
            Interactive visualization of criminal networks & entity relationships
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network Visualization Area */}
          <div className="lg:col-span-2">
            <Card className="p-6 h-full min-h-96">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Network Graph
                </h3>

                {/* Simplified Network Visualization */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 h-96 flex flex-col items-center justify-center border-2 border-dashed border-border relative overflow-hidden">
                  {/* Center Node */}
                  {selectedNode && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Connecting Lines */}
                      <svg
                        className="absolute inset-0 w-full h-full"
                        style={{ pointerEvents: "none" }}
                      >
                        {connectedNodes.map((node, idx) => {
                          const angle = (idx / connectedNodes.length) * Math.PI * 2;
                          const x = 150 + 120 * Math.cos(angle);
                          const y = 150 + 120 * Math.sin(angle);
                          return (
                            <line
                              key={idx}
                              x1="150"
                              y1="150"
                              x2={x}
                              y2={y}
                              stroke="hsl(219 23% 91%)"
                              strokeWidth="2"
                              strokeDasharray="5,5"
                            />
                          );
                        })}
                      </svg>

                      {/* Center Node */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white shadow-lg mb-2 animate-pulse">
                          {getNodeIcon(selectedNode.type)}
                        </div>
                        <p className="text-sm font-bold text-center text-foreground">
                          {selectedNode.label}
                        </p>
                        <Badge className="mt-2 bg-primary text-white">
                          Risk: {selectedNode.riskScore}%
                        </Badge>
                      </div>

                      {/* Connected Nodes */}
                      {connectedNodes.map((node, idx) => {
                        const angle = (idx / connectedNodes.length) * Math.PI * 2;
                        const x = 150 + 120 * Math.cos(angle);
                        const y = 150 + 120 * Math.sin(angle);

                        return (
                          <div
                            key={node.id}
                            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 smooth-transition"
                            style={{ left: `${x}px`, top: `${y}px` }}
                            onClick={() => setSelectedNode(node)}
                          >
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md ${getNodeColor(node.type).replace(
                                "text-",
                                "bg-"
                              )} border-2 border-white`}
                            >
                              {getNodeIcon(node.type)}
                            </div>
                            <p className="text-xs font-medium text-center mt-1 max-w-16 truncate text-foreground">
                              {node.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Empty State */}
                  {!selectedNode && (
                    <div className="text-center">
                      <AlertTriangle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        Select a node to view network
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-border">
                {[
                  { type: "person", label: "Person" },
                  { type: "phone", label: "Phone" },
                  { type: "upi", label: "UPI" },
                  { type: "device", label: "Device" },
                  { type: "location", label: "Location" },
                  { type: "bank", label: "Bank" },
                ].map((item) => (
                  <div key={item.type} className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getNodeColor(item.type).split(" ")[0]}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Node Details Panel */}
          <div className="space-y-4">
            {selectedNode && (
              <>
                {/* Selected Node Info */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Selected Entity
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Label</p>
                      <p className="font-mono font-bold text-foreground">
                        {selectedNode.label}
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Type</p>
                      <Badge className={getNodeColor(selectedNode.type)}>
                        {selectedNode.type}
                      </Badge>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-muted-foreground">Risk Score</p>
                        <span className="text-2xl font-bold text-red-500">
                          {selectedNode.riskScore}%
                        </span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                          style={{ width: `${selectedNode.riskScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">
                        Connections
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {selectedNode.connections}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Timeline */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Activity Timeline
                  </h3>
                  <div className="space-y-3">
                    {[
                      { time: "2 hours ago", event: "Network activity detected" },
                      { time: "5 hours ago", event: "Money transfer initiated" },
                      { time: "1 day ago", event: "First complaint filed" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {item.time}
                        </div>
                        <div className="h-1 w-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                        <p className="text-xs text-foreground">{item.event}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Connections Table */}
        {selectedNode && connections.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Direct Connections ({connections.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      Source
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      Target
                    </th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                      Weight
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((conn, idx) => {
                    const sourceNode = graphNodes.find(
                      (n) => n.id === conn.source
                    );
                    const targetNode = graphNodes.find(
                      (n) => n.id === conn.target
                    );
                    return (
                      <tr
                        key={idx}
                        className="border-b border-border hover:bg-muted/50 smooth-transition"
                      >
                        <td className="py-3 px-4 font-mono text-xs">
                          {sourceNode?.label}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            {conn.type.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">
                          {targetNode?.label}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          {conn.weight}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* All Nodes */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Network Entities ({graphNodes.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {graphNodes.map((node) => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-4 border-2 rounded-lg cursor-pointer smooth-transition ${
                  selectedNode?.id === node.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${getNodeColor(node.type).replace(
                      "text-",
                      "bg-"
                    )}`}
                  >
                    {getNodeIcon(node.type)}
                  </div>
                  <Badge
                    className={
                      node.riskScore > 90
                        ? "bg-red-500 text-white"
                        : node.riskScore > 70
                          ? "bg-orange-500 text-white"
                          : "bg-blue-500 text-white"
                    }
                  >
                    {node.riskScore}%
                  </Badge>
                </div>
                <p className="font-semibold text-foreground mb-1">
                  {node.label}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {node.type.replace(/_/g, " ")}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {node.connections} connections
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </SatarkLayout>
  );
}
