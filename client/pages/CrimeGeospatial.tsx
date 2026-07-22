import { SatarkLayout } from "@/components/SatarkLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import type { Location } from "@/engine/types";
import { useMemo, useState } from "react";
import {
  MapPin,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

type HeatmapHotspot = {
  city: string;
  state: string;
  lat: number;
  lng: number;
  risk: Location["risk"];
  caseCount: number;
  relatedCities: string[];
};

const IndiaThreatHotspots: HeatmapHotspot[] = [
  {
    city: "Delhi",
    state: "Delhi",
    lat: 28.6139,
    lng: 77.209,
    risk: "critical",
    caseCount: 12,
    relatedCities: ["Mumbai", "Ahmedabad", "Kolkata"],
  },
  {
    city: "Mumbai",
    state: "Maharashtra",
    lat: 19.076,
    lng: 72.8777,
    risk: "critical",
    caseCount: 18,
    relatedCities: ["Pune", "Ahmedabad", "Hyderabad"],
  },
  {
    city: "Pune",
    state: "Maharashtra",
    lat: 18.5204,
    lng: 73.8567,
    risk: "medium",
    caseCount: 6,
    relatedCities: ["Mumbai", "Bengaluru"],
  },
  {
    city: "Bengaluru",
    state: "Karnataka",
    lat: 12.9716,
    lng: 77.5946,
    risk: "high",
    caseCount: 11,
    relatedCities: ["Hyderabad", "Chennai", "Pune"],
  },
  {
    city: "Hyderabad",
    state: "Telangana",
    lat: 17.385,
    lng: 78.4867,
    risk: "high",
    caseCount: 9,
    relatedCities: ["Bengaluru", "Chennai", "Mumbai"],
  },
  {
    city: "Kolkata",
    state: "West Bengal",
    lat: 22.5726,
    lng: 88.3639,
    risk: "critical",
    caseCount: 15,
    relatedCities: ["Delhi", "Chennai"],
  },
  {
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0827,
    lng: 80.2707,
    risk: "medium",
    caseCount: 5,
    relatedCities: ["Bengaluru", "Hyderabad", "Kolkata"],
  },
  {
    city: "Ahmedabad",
    state: "Gujarat",
    lat: 23.0225,
    lng: 72.5714,
    risk: "low",
    caseCount: 4,
    relatedCities: ["Mumbai", "Delhi"],
  },
];

const indiaThreatLinks = [
  ["Delhi", "Mumbai"],
  ["Delhi", "Kolkata"],
  ["Mumbai", "Pune"],
  ["Mumbai", "Ahmedabad"],
  ["Bengaluru", "Hyderabad"],
  ["Bengaluru", "Chennai"],
  ["Kolkata", "Chennai"],
  ["Hyderabad", "Mumbai"],
] as const;

const indiaBounds = {
  latMin: 8,
  latMax: 37.8,
  lngMin: 67.8,
  lngMax: 97.6,
};

const svgWidth = 1000;
const svgHeight = 1200;

function projectIndiaPoint(lat: number, lng: number) {
  const x = ((lng - indiaBounds.lngMin) / (indiaBounds.lngMax - indiaBounds.lngMin)) * svgWidth;
  const y = ((indiaBounds.latMax - lat) / (indiaBounds.latMax - indiaBounds.latMin)) * svgHeight;
  return { x, y };
}

export default function CrimeGeospatial() {
  const { locations, investigations } = useApp();
  const [selectedLocation, setSelectedLocation] = useState<HeatmapHotspot>(IndiaThreatHotspots[0]);
  const [filterDistrict, setFilterDistrict] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");

  const filterStates = useMemo(() => {
    return Array.from(
      new Set([...locations.map((location) => location.state), ...IndiaThreatHotspots.map((hotspot) => hotspot.state)])
    ).sort((left, right) => left.localeCompare(right));
  }, [locations]);

  const filteredLocations =
    filterDistrict === "all"
      ? IndiaThreatHotspots
      : IndiaThreatHotspots.filter((hotspot) => hotspot.state === filterDistrict);

  const visibleLocations =
    filterRisk === "all"
      ? filteredLocations
      : filteredLocations.filter((hotspot) => hotspot.risk === filterRisk);

  const getCasesByLocation = (city: string) => {
    const normalizedCity = city.toLowerCase();
    const matchedHotspot = IndiaThreatHotspots.find((hotspot) => {
      const hotspotCity = hotspot.city.toLowerCase();
      if (normalizedCity === "bengaluru") {
        return hotspotCity === "bengaluru" || hotspotCity === "bangalore";
      }
      if (normalizedCity === "bangalore") {
        return hotspotCity === "bengaluru" || hotspotCity === "bangalore";
      }
      return hotspotCity === normalizedCity;
    });

    const matchedLocation = locations.find((location) => {
      const locationCity = location.city.toLowerCase();
      if (normalizedCity === "bengaluru") {
        return locationCity === "bengaluru" || locationCity === "bangalore";
      }
      if (normalizedCity === "bangalore") {
        return locationCity === "bengaluru" || locationCity === "bangalore";
      }
      return locationCity === normalizedCity;
    });

    return matchedLocation?.caseCount ?? matchedHotspot?.caseCount ?? investigations.filter((investigation) => {
      const investigationCity = investigation.location?.city?.toLowerCase();
      if (!investigationCity) return false;
      if (normalizedCity === "bengaluru" || normalizedCity === "bangalore") {
        return investigationCity === "bangalore" || investigationCity === "bengaluru";
      }
      return investigationCity === normalizedCity;
    }).length;
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

  const criticalCount = visibleLocations.filter((location) => location.risk === "critical").length;
  const highCount = visibleLocations.filter((location) => location.risk === "high").length;
  const mediumCount = visibleLocations.filter((location) => location.risk === "medium").length;
  const lowCount = visibleLocations.filter((location) => location.risk === "low").length;

  const mapInsight =
    criticalCount > 0
      ? `${criticalCount} critical hotspot${criticalCount > 1 ? "s" : ""} are driving the highest complaint density, led by ${visibleLocations
          .filter((location) => location.risk === "critical")
          .slice(0, 2)
          .map((location) => location.city)
          .join(" and ")}.`
      : visibleLocations.length > 0
        ? `${visibleLocations[0].city} currently shows the highest activity in the filtered set, with ${visibleLocations[0].caseCount} active cases.`
        : "No hotspots match the current filters.";

  const recommendedAction =
    criticalCount > 0
      ? "Increase cyber awareness campaigns and intensify patrol coordination around critical hotspots."
      : "Maintain monitoring and continue targeted outreach across the visible hotspots.";

  const linePairs = indiaThreatLinks
    .map(([sourceCity, targetCity]) => {
      const source = IndiaThreatHotspots.find((hotspot) => hotspot.city === sourceCity);
      const target = IndiaThreatHotspots.find((hotspot) => hotspot.city === targetCity);

      if (!source || !target) return null;

      const sourcePoint = projectIndiaPoint(source.lat, source.lng);
      const targetPoint = projectIndiaPoint(target.lat, target.lng);

      return { sourcePoint, targetPoint };
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line));

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
                {filterStates.map(
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

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)] gap-6 items-start">
          {/* Map Visualization */}
          <div className="space-y-6">
            <Card className="p-6 overflow-hidden">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Cyber Threat Heatmap of India
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Glowing cyber threat clusters, connected intelligence lines, and live hotspot selection.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border bg-muted/40 px-3 py-1">
                    {visibleLocations.length} hotspots
                  </span>
                  <span className="rounded-full border border-border bg-muted/40 px-3 py-1">
                    {investigations.length} cases
                  </span>
                </div>
              </div>

              <div className="relative min-h-[620px] overflow-hidden rounded-3xl border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,255,0.98))] shadow-sm">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="h-[620px] w-full md:h-[760px]"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient id="indiaSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(76,29,149,0.08)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                    </linearGradient>
                    <pattern id="gridPattern" width="80" height="80" patternUnits="userSpaceOnUse">
                      <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(124,58,237,0.06)" strokeWidth="1" />
                    </pattern>
                    <filter id="hotGlowLow" x="-200%" y="-200%" width="500%" height="500%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="hotGlowMedium" x="-200%" y="-200%" width="500%" height="500%">
                      <feGaussianBlur stdDeviation="8" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="hotGlowHigh" x="-250%" y="-250%" width="600%" height="600%">
                      <feGaussianBlur stdDeviation="12" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="hotGlowCritical" x="-250%" y="-250%" width="600%" height="600%">
                      <feGaussianBlur stdDeviation="15" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#indiaSky)" />
                  <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#gridPattern)" />

                  <path
                    d="M 390 110 L 470 115 L 528 160 L 560 218 L 620 255 L 660 320 L 685 390 L 673 465 L 642 525 L 615 586 L 576 650 L 532 725 L 480 777 L 430 805 L 390 790 L 370 742 L 328 706 L 286 664 L 256 615 L 220 566 L 189 512 L 170 450 L 182 394 L 214 338 L 248 293 L 280 248 L 312 195 L 351 150 Z"
                    fill="rgba(124,58,237,0.08)"
                    stroke="rgba(76,29,149,0.48)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 390 110 L 470 115 L 528 160 L 560 218 L 620 255 L 660 320 L 685 390 L 673 465 L 642 525 L 615 586 L 576 650 L 532 725 L 480 777 L 430 805 L 390 790 L 370 742 L 328 706 L 286 664 L 256 615 L 220 566 L 189 512 L 170 450 L 182 394 L 214 338 L 248 293 L 280 248 L 312 195 L 351 150 Z"
                    fill="none"
                    stroke="rgba(255,255,255,0.88)"
                    strokeWidth="1.75"
                    strokeDasharray="8 10"
                    strokeLinecap="round"
                  />

                  {linePairs.map(({ sourcePoint, targetPoint }, index) => (
                    <line
                      key={`${index}-${sourcePoint.x}-${targetPoint.x}`}
                      x1={sourcePoint.x}
                      y1={sourcePoint.y}
                      x2={targetPoint.x}
                      y2={targetPoint.y}
                      stroke="rgba(124,58,237,0.28)"
                      strokeWidth="2.25"
                      strokeDasharray="8 10"
                      strokeLinecap="round"
                    />
                  ))}

                  {visibleLocations.map((hotspot) => {
                    const point = projectIndiaPoint(hotspot.lat, hotspot.lng);
                    const selected = selectedLocation.city === hotspot.city;
                    const isCritical = hotspot.risk === "critical";
                    const isHigh = hotspot.risk === "high";
                    const riskColor =
                      hotspot.risk === "critical"
                        ? "#dc2626"
                        : hotspot.risk === "high"
                          ? "#ea580c"
                          : hotspot.risk === "medium"
                            ? "#eab308"
                            : "#22c55e";
                    const glowFilter =
                      hotspot.risk === "critical"
                        ? "url(#hotGlowCritical)"
                        : hotspot.risk === "high"
                          ? "url(#hotGlowHigh)"
                          : hotspot.risk === "medium"
                            ? "url(#hotGlowMedium)"
                            : "url(#hotGlowLow)";

                    return (
                      <g
                        key={hotspot.city}
                        transform={`translate(${point.x} ${point.y})`}
                        className="cursor-pointer transition-transform duration-200 hover:scale-110"
                        style={{ transformBox: "fill-box", transformOrigin: "center" }}
                        onClick={() => setSelectedLocation(hotspot)}
                      >
                        {isHigh || isCritical ? (
                          <circle
                            r={selected ? 48 : isCritical ? 42 : 34}
                            fill={riskColor}
                            opacity="0.16"
                            filter={glowFilter}
                          >
                            <animate
                              attributeName="r"
                              values={`${isCritical ? 34 : 28};${isCritical ? 48 : 40};${isCritical ? 34 : 28}`}
                              dur={isCritical ? "2.2s" : "2.8s"}
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              values="0.22;0.06;0.22"
                              dur={isCritical ? "2.2s" : "2.8s"}
                              repeatCount="indefinite"
                            />
                          </circle>
                        ) : (
                          <circle r={selected ? 24 : 20} fill={riskColor} opacity="0.16" filter={glowFilter} />
                        )}

                        <circle
                          r={selected ? 20 : 14}
                          fill={riskColor}
                          stroke="rgba(255,255,255,0.95)"
                          strokeWidth={selected ? 4.5 : 3.5}
                          filter={glowFilter}
                        />

                        <circle r={selected ? 5 : 4} fill="rgba(255,255,255,0.96)" />

                        <text
                          y={selected ? -22 : -18}
                          textAnchor="middle"
                          className="fill-foreground text-[14px] font-semibold"
                        >
                          {hotspot.city}
                        </text>
                        <text
                          y={selected ? -6 : -4}
                          textAnchor="middle"
                          className="fill-muted-foreground text-[11px]"
                        >
                          {hotspot.state}
                        </text>
                        <text
                          y={selected ? 26 : 22}
                          textAnchor="middle"
                          className="fill-foreground text-[12px] font-medium"
                        >
                          {hotspot.caseCount} cases
                        </text>
                      </g>
                    );
                  })}

                  <g opacity="0.34">
                    <text x="80" y="1040" className="fill-muted-foreground text-[16px] uppercase tracking-[0.4em]">
                      SATARK CYBER THREAT HEATMAP
                    </text>
                    <text x="80" y="1070" className="fill-muted-foreground text-[12px]">
                      India hotspot intelligence with live threat clustering
                    </text>
                  </g>
                </svg>

                {/* Floating Legend */}
                <div className="absolute bottom-4 left-4 z-20 rounded-2xl border border-border/70 bg-white/90 p-4 text-sm shadow-xl backdrop-blur">
                  <p className="mb-3 font-semibold text-foreground">Risk Level</p>
                  <div className="space-y-2">
                    {[
                      { risk: "low", label: "Low", color: "#22c55e" },
                      { risk: "medium", label: "Medium", color: "#eab308" },
                      { risk: "high", label: "High", color: "#ea580c" },
                      { risk: "critical", label: "Critical", color: "#dc2626" },
                    ].map((item) => (
                      <div key={item.risk} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full ring-2 ring-white"
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

            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <TrendingUp className="h-5 w-5 text-primary" />
                AI Insight
              </h3>
              <div className="space-y-4">
                <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                  <p className="text-sm font-medium text-foreground">
                    {mapInsight}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Recommended Action
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    {recommendedAction}
                  </p>
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
                      {selectedLocation.caseCount}
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Threat Level</p>
                    <p className="text-2xl font-bold capitalize text-foreground">
                      {selectedLocation.risk}
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Total</span>
                  <span className="mt-2 block text-2xl font-bold text-primary">{visibleLocations.length}</span>
                </div>
                <div className="rounded-2xl border border-border bg-red-50 p-4">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Critical</span>
                  <span className="mt-2 block text-2xl font-bold text-red-600">{criticalCount}</span>
                </div>
                <div className="rounded-2xl border border-border bg-orange-50 p-4">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">High</span>
                  <span className="mt-2 block text-2xl font-bold text-orange-600">{highCount}</span>
                </div>
                <div className="rounded-2xl border border-border bg-blue-50 p-4">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Cases</span>
                  <span className="mt-2 block text-2xl font-bold text-primary">{investigations.length}</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                  <span className="text-sm text-muted-foreground">Medium</span>
                  <span className="text-lg font-semibold text-foreground">{mediumCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                  <span className="text-sm text-muted-foreground">Low</span>
                  <span className="text-lg font-semibold text-foreground">{lowCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                  <span className="text-sm text-muted-foreground">Selected</span>
                  <span className="text-lg font-semibold text-foreground">
                    {selectedLocation ? selectedLocation.city : "None"}
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
                      {location.caseCount}
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
