import { SatarkLayout } from "@/components/SatarkLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import {
  MapPin,
  Filter,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Clock,
} from "lucide-react";

export default function CrimeGeospatial() {
  const { locations, investigations } = useApp();
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [filterDistrict, setFilterDistrict] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");

  const filteredLocations =
    filterDistrict === "all"
      ? locations
      : locations.filter((l) => l.state === filterDistrict);

  const visibleLocations =
    filterRisk === "all"
      ? filteredLocations
      : filteredLocations.filter((location) => location.risk === filterRisk);

  const getCasesByLocation = (city: string) => {
    return investigations.filter((inv) => inv.location?.city === city).length;
  };

  const getHeatmapColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "rgb(220, 38, 38)"; // red-600
      case "high":
        return "rgb(234, 88, 12)"; // orange-600
      case "medium":
        return "rgb(234, 179, 8)"; // yellow-500
      default:
        return "rgb(59, 130, 246)"; // blue-500
    }
  };

  const getRiskLabel = (risk: string) => {
    return risk.charAt(0).toUpperCase() + risk.slice(1);
  };

  return (
    <SatarkLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Geospatial Crime Intelligence
          </h1>
          <p className="text-muted-foreground mt-2">
            Interactive mapping of crime hotspots and fraud distribution across India
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground block mb-2">
                Filter by State
              </label>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-white text-foreground"
              >
                <option value="all">All States</option>
                {Array.from(new Set(locations.map((l) => l.state))).map(
                  (state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-foreground block mb-2">
                Filter by Risk
              </label>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-white text-foreground"
              >
                <option value="all">All Risk Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={() => {
                  setFilterDistrict("all");
                  setFilterRisk("all");
                }}
                variant="outline"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Visualization */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Crime Hotspot Heatmap
              </h3>

              {/* Simulated India Map with Locations */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 min-h-96 relative border border-blue-200">
                {/* India Map Outline (Simplified SVG) */}
                <svg
                  viewBox="0 0 800 900"
                  className="w-full h-full absolute inset-0"
                  style={{ opacity: 0.3 }}
                >
                  <path
                    d="M 300 150 L 500 140 L 550 200 L 580 180 L 600 250 L 620 300 L 580 350 L 550 400 L 500 420 L 450 450 L 400 480 L 350 500 L 300 480 L 280 420 L 300 350 L 320 300 L 300 250 L 280 200 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-blue-300"
                  />
                </svg>

                {/* Location Markers */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {visibleLocations.map((location) => {
                      const caseCount = getCasesByLocation(location.city);
                      const shouldShow =
                        filterRisk === "all" || filterRisk === location.risk;

                      if (!shouldShow) return null;

                      return (
                        <div
                          key={location.city}
                          onClick={() => setSelectedLocation(location)}
                          className={`p-3 rounded-lg cursor-pointer smooth-transition border-2 ${selectedLocation.city === location.city
                              ? "border-primary bg-white shadow-lg"
                              : "border-transparent hover:border-primary/50 bg-white/80"
                            }`}
                        >
                          {/* Heatmap Dot */}
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-4 h-4 rounded-full shadow-lg"
                              style={{
                                backgroundColor: getHeatmapColor(location.risk),
                              }}
                            />
                            <span className="font-semibold text-sm text-foreground">
                              {location.city}
                            </span>
                          </div>

                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>{location.state}</p>
                            <p className="font-mono">
                              {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
                            </p>
                          </div>

                          <div className="mt-2 pt-2 border-t border-border flex justify-between items-center">
                            <Badge
                              className={
                                location.risk === "critical"
                                  ? "bg-red-100 text-red-800"
                                  : location.risk === "high"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-blue-100 text-blue-800"
                              }
                            >
                              {getRiskLabel(location.risk)}
                            </Badge>
                            <span className="text-xs font-bold text-foreground">
                              {caseCount} cases
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Heatmap Legend */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg p-4 border border-border z-20 text-sm">
                  <p className="font-semibold text-foreground mb-3">Risk Level</p>
                  <div className="space-y-2">
                    {[
                      { risk: "critical", label: "Critical", color: "rgb(220, 38, 38)" },
                      { risk: "high", label: "High", color: "rgb(234, 88, 12)" },
                      { risk: "medium", label: "Medium", color: "rgb(234, 179, 8)" },
                      { risk: "low", label: "Low", color: "rgb(59, 130, 246)" },
                    ].map((item) => (
                      <div
                        key={item.risk}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Location Details */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Location Details
              </h3>

              {selectedLocation && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">City</p>
                    <p className="font-bold text-foreground">
                      {selectedLocation.city}
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">State</p>
                    <p className="font-bold text-foreground">
                      {selectedLocation.state}
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">
                      Risk Level
                    </p>
                    <Badge
                      className={
                        selectedLocation.risk === "critical"
                          ? "bg-red-500 text-white w-full justify-center"
                          : selectedLocation.risk === "high"
                            ? "bg-orange-500 text-white w-full justify-center"
                            : "bg-blue-500 text-white w-full justify-center"
                      }
                    >
                      {getRiskLabel(selectedLocation.risk)}
                    </Badge>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      Active Cases
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {getCasesByLocation(selectedLocation.city)}
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      Coordinates
                    </p>
                    <p className="font-mono text-xs text-foreground">
                      {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Statistics */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Hotspot Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Hotspots</span>
                  <span className="text-2xl font-bold text-primary">
                    {visibleLocations.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Critical</span>
                  <span className="text-2xl font-bold text-red-600">
                    {visibleLocations.filter((l) => l.risk === "critical").length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Cases</span>
                  <span className="text-2xl font-bold text-primary">
                    {investigations.length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Detailed Hotspot Analysis */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Hotspot Analysis & Recommendations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emerging Threats */}
            <div>
              <p className="font-semibold text-foreground mb-3">
                <AlertTriangle className="inline w-4 h-4 mr-2" />
                Emerging Threats
              </p>
              <div className="space-y-2">
                {[
                  "Digital arrest scam spike in Mumbai Region (↑ 45%)",
                  "Counterfeit currency network in Delhi-NCR",
                  "UPI fraud cluster in Bangalore Metro",
                  "Multi-state banking fraud syndicate",
                ].map((threat, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-900"
                  >
                    {threat}
                  </div>
                ))}
              </div>
            </div>

            {/* Patrol Recommendations */}
            <div>
              <p className="font-semibold text-foreground mb-3">
                <MapPin className="inline w-4 h-4 mr-2" />
                Patrol Recommendations
              </p>
              <div className="space-y-2">
                {[
                  "High alert: Mumbai, Pune, Kolkata",
                  "Increase cyber crime unit presence",
                  "Deploy plainclothes officers in hotspots",
                  "24/7 monitoring in critical zones",
                ].map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900"
                  >
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* All Locations Table */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">
            All Hotspots
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    City
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    State
                  </th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-medium">
                    Risk
                  </th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-medium">
                    Cases
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    Coordinates
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleLocations.map((location) => (
                  <tr
                    key={location.city}
                    className="border-b border-border hover:bg-muted/50 smooth-transition cursor-pointer"
                    onClick={() => setSelectedLocation(location)}
                  >
                    <td className="py-3 px-4 font-medium text-foreground">
                      {location.city}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {location.state}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        className={
                          location.risk === "critical"
                            ? "bg-red-100 text-red-800"
                            : location.risk === "high"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                        }
                      >
                        {getRiskLabel(location.risk)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-foreground">
                      {getCasesByLocation(location.city)}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                      {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </SatarkLayout>
  );
}
