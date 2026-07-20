import { SatarkLayout } from "@/components/SatarkLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lock,
  Banknote,
  Network,
  MapPin,
  Clock,
  Activity,
  Eye,
  Phone,
} from "lucide-react";
import { useState, useEffect } from "react";

const chartColors = {
  primary: "hsl(219 68% 45%)",
  secondary: "hsl(264 70% 50%)",
  success: "hsl(142 71% 45%)",
  danger: "hsl(0 84% 60%)",
  warning: "hsl(38 92% 50%)",
};

const KPICard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: { direction: "up" | "down"; value: number };
}) => (
  <Card className="p-6 card-hover group">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mt-2">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center text-primary group-hover:shadow-lg group-hover:shadow-primary/30 smooth-transition">
        {Icon}
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-1 mt-3 text-xs">
        <TrendingUp
          className={`w-4 h-4 ${
            trend.direction === "up"
              ? "text-green-500"
              : "text-red-500 rotate-180"
          }`}
        />
        <span
          className={trend.direction === "up" ? "text-green-600" : "text-red-600"}
        >
          {trend.direction === "up" ? "+" : "-"}
          {trend.value}% this week
        </span>
      </div>
    )}
  </Card>
);

const RiskBadge = ({ risk }: { risk: string }) => {
  const riskConfig = {
    critical: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
    high: { bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500" },
    medium: { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" },
    low: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
  };

  const config = riskConfig[risk as keyof typeof riskConfig] || riskConfig.low;

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${config.bg} ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {risk.charAt(0).toUpperCase() + risk.slice(1)}
    </div>
  );
};

export default function Dashboard() {
  const { investigations, alerts, getStats, locations } = useApp();
  const [chartData, setChartData] = useState<any[]>([]);
  const [caseDistribution, setCaseDistribution] = useState<any[]>([]);

  const stats = getStats();

  useEffect(() => {
    // Generate alert trend data
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        alerts: 45 + Math.floor(Math.random() * 30),
        prevented: 38 + Math.floor(Math.random() * 25),
      });
    }
    setChartData(data);

    // Generate case distribution
    const distribution = [
      {
        name: "Digital Arrest",
        value: stats.digitalArrestCases,
        color: chartColors.danger,
      },
      {
        name: "Banking Fraud",
        value: Math.floor(stats.totalCases * 0.3),
        color: chartColors.secondary,
      },
      {
        name: "Counterfeit",
        value: stats.counterfeitCases,
        color: chartColors.warning,
      },
      {
        name: "Other Fraud",
        value: Math.floor(stats.totalCases * 0.2),
        color: chartColors.primary,
      },
    ];
    setCaseDistribution(distribution);
  }, [stats]);

  const riskScoreData = [
    { hour: "0h", critical: 12, high: 24, medium: 35, low: 18 },
    { hour: "4h", critical: 15, high: 28, medium: 32, low: 15 },
    { hour: "8h", critical: 18, high: 32, medium: 28, low: 12 },
    { hour: "12h", critical: 21, high: 35, medium: 25, low: 10 },
    { hour: "16h", critical: 19, high: 33, medium: 30, low: 13 },
    { hour: "20h", critical: 16, high: 29, medium: 34, low: 16 },
  ];

  const recentInvestigations = investigations.slice(0, 5);

  return (
    <SatarkLayout>
      <div className="p-6 md:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Intelligence Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time cyber fraud detection & public safety platform
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Active Cases"
            value={stats.totalCases.toString()}
            icon={<Lock className="w-6 h-6" />}
            subtitle="Across all modules"
            trend={{ direction: "up", value: 12 }}
          />
          <KPICard
            title="High Risk Alerts"
            value={stats.highRiskAlerts.toString()}
            icon={<AlertTriangle className="w-6 h-6" />}
            subtitle="Last 24 hours"
            trend={{ direction: "down", value: 8 }}
          />
          <KPICard
            title="Frauds Prevented"
            value={stats.fraudsPrevented.toString()}
            icon={<CheckCircle className="w-6 h-6" />}
            subtitle="This month"
            trend={{ direction: "up", value: 24 }}
          />
          <KPICard
            title="Network Nodes"
            value={stats.networkNodes.toString()}
            icon={<Network className="w-6 h-6" />}
            subtitle="Active entities mapped"
            trend={{ direction: "up", value: 18 }}
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title="Digital Arrest Cases"
            value={stats.digitalArrestCases.toString()}
            icon={<Phone className="w-6 h-6" />}
            subtitle="Active investigations"
          />
          <KPICard
            title="Counterfeit Detected"
            value={stats.counterfeitCases.toString()}
            icon={<Banknote className="w-6 h-6" />}
            subtitle="Currency validations"
          />
          <KPICard
            title="Crime Hotspots"
            value={stats.hotspots.toString()}
            icon={<MapPin className="w-6 h-6" />}
            subtitle="Geographic clusters"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alert Trends */}
          <Card className="lg:col-span-2 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-foreground">
                Alert Trends & Prevention
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Weekly alerts vs successfully prevented cases
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.danger} stopOpacity={0.3} />
                    <stop
                      offset="95%"
                      stopColor={chartColors.danger}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="colorPrevented"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.3} />
                    <stop
                      offset="95%"
                      stopColor={chartColors.success}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(219 23% 91%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(217 12% 43%)"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="hsl(217 12% 43%)"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: `1px solid hsl(219 23% 91%)`,
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="alerts"
                  stroke={chartColors.danger}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAlerts)"
                  name="Total Alerts"
                />
                <Area
                  type="monotone"
                  dataKey="prevented"
                  stroke={chartColors.success}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrevented)"
                  name="Prevented"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Case Distribution */}
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-foreground">
                Case Distribution
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Active cases by type
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={caseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {caseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: `1px solid hsl(219 23% 91%)`,
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {caseDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Risk Score Distribution */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground">
              Risk Level Distribution (24h)
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Cases by severity level throughout the day
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskScoreData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(219 23% 91%)"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                stroke="hsl(217 12% 43%)"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="hsl(217 12% 43%)"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: `1px solid hsl(219 23% 91%)`,
                  borderRadius: "8px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="critical"
                stackId="a"
                fill={chartColors.danger}
                radius={[4, 4, 0, 0]}
                name="Critical"
              />
              <Bar
                dataKey="high"
                stackId="a"
                fill={chartColors.warning}
                radius={[4, 4, 0, 0]}
                name="High"
              />
              <Bar
                dataKey="medium"
                stackId="a"
                fill={chartColors.secondary}
                radius={[4, 4, 0, 0]}
                name="Medium"
              />
              <Bar
                dataKey="low"
                stackId="a"
                fill={chartColors.primary}
                radius={[4, 4, 0, 0]}
                name="Low"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Live Alerts & Recent Investigations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Alert Feed */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Live Alert Feed
                </h3>
              </div>
              <Badge variant="outline" className="bg-red-50">
                {alerts.length} Active
              </Badge>
            </div>

            <div className="space-y-3">
              {alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 smooth-transition group cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div
                      className="w-2 h-2 mt-1 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          alert.severity === "critical"
                            ? chartColors.danger
                            : alert.severity === "high"
                              ? chartColors.warning
                              : chartColors.primary,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {alert.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.description}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {Math.floor(
                          (Date.now() - alert.timestamp.getTime()) / 60000
                        )}{" "}
                        mins ago
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Investigations */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-secondary" />
                Recent Investigations
              </h3>
              <Badge variant="outline">{investigations.length} Cases</Badge>
            </div>

            <div className="space-y-2">
              {recentInvestigations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 border border-border rounded-lg hover:bg-muted/50 smooth-transition cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-foreground">
                      {inv.id}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {inv.type.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RiskBadge risk={inv.riskLevel} />
                    <Badge variant="secondary" className="text-xs">
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Recommendations & Evidence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Recommendations */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              AI Recommendations
            </h3>
            <div className="space-y-3">
              {[
                `Investigate ${Math.floor(Math.random() * 25) + 10} new phone numbers linked to digital arrest networks`,
                `Deploy geospatial intelligence to emerging hotspots in ${locations[Math.floor(Math.random() * locations.length)].city}`,
                `Cross-reference ${Math.floor(Math.random() * 8) + 1} pending cases with historical fraud templates`,
                `Prioritize ${stats.digitalArrestCases} counterfeit cases with critical severity this week`,
              ].map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-lg text-sm text-foreground"
                >
                  {rec}
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Evidence Uploads */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Recent Evidence Uploads
            </h3>
            <div className="space-y-2">
              {[
                { name: "Call_Recording_INV2024001.wav", time: "5 mins ago" },
                { name: "Currency_Image_Analysis.pdf", time: "12 mins ago" },
                { name: "UPI_Transaction_Graph.json", time: "28 mins ago" },
                { name: "Location_Heatmap_Data.geojson", time: "1 hour ago" },
                { name: "Voice_Transcript_Call_01.txt", time: "2 hours ago" },
              ].map((ev, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 smooth-transition cursor-pointer"
                >
                  <span className="text-sm text-foreground truncate">
                    {ev.name}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {ev.time}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </SatarkLayout>
  );
}
