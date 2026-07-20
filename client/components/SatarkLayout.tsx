import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Shield,
  Phone,
  Banknote,
  Network,
  Map,
  FolderOpen,
  Archive,
  FileText,
  BookOpen,
  Settings,
  Menu,
  X,
  AlertCircle,
  Command,
} from "lucide-react";
import { Button } from "./ui/button";

const navItems = [
  { icon: BarChart3, label: "Dashboard", path: "/" },
  { icon: Shield, label: "Citizen Fraud Shield", path: "/citizen-fraud-shield" },
  { icon: Phone, label: "Digital Arrest Detection", path: "/digital-arrest" },
  { icon: Banknote, label: "Counterfeit Detection", path: "/counterfeit" },
  { icon: Network, label: "Fraud Network", path: "/fraud-network" },
  { icon: Map, label: "Crime Geospatial", path: "/crime-geospatial" },
  { icon: FolderOpen, label: "Case Management", path: "/cases" },
  { icon: Archive, label: "Evidence Repository", path: "/evidence" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Command, label: "National Command Center", path: "/national-command-center" },
  { icon: BookOpen, label: "Knowledge Base", path: "/knowledge-base" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface SatarkLayoutProps {
  children: React.ReactNode;
}

export function SatarkLayout({ children }: SatarkLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40",
          sidebarOpen ? "w-64" : "w-20",
          "lg:relative lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-3 mb-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20",
              !sidebarOpen && "justify-center"
            )}
          >
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg text-white font-bold">
              S
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-xs font-bold text-sidebar-foreground">
                  SATARK 360
                </p>
                <p className="text-xs text-sidebar-accent-foreground">
                  Cyber Intelligence
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path}>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/30"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="text-sm font-medium truncate">
                        {item.label}
                      </span>
                    )}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="pt-4 border-t border-sidebar-border">
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-foreground",
                !sidebarOpen && "justify-center"
              )}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                SC
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">Senior Officer</p>
                  <p className="text-xs text-sidebar-accent-foreground truncate">
                    Cyber Crime Unit
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-border h-16 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
              <AlertCircle className="w-5 h-5 text-primary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/20">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
