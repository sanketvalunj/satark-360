import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CitizenFraudShield from "./pages/CitizenFraudShield";
import DigitalArrest from "./pages/DigitalArrest";
import CounterfeitDetection from "./pages/CounterfeitDetection";
import FraudNetwork from "./pages/FraudNetwork";
import CrimeGeospatial from "./pages/CrimeGeospatial";
import CaseManagement from "./pages/CaseManagement";
import EvidenceRepository from "./pages/EvidenceRepository";
import Reports from "./pages/Reports";
import KnowledgeBase from "./pages/KnowledgeBase";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/citizen-fraud-shield" element={<CitizenFraudShield />} />
          <Route path="/digital-arrest" element={<DigitalArrest />} />
          <Route path="/counterfeit" element={<CounterfeitDetection />} />
          <Route path="/fraud-network" element={<FraudNetwork />} />
          <Route path="/crime-geospatial" element={<CrimeGeospatial />} />
          <Route path="/cases" element={<CaseManagement />} />
          <Route path="/evidence" element={<EvidenceRepository />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
