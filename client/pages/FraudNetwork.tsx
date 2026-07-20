import { Network } from "lucide-react";
import PlaceholderPage from "./PlaceholderPage";

export default function FraudNetwork() {
  return (
    <PlaceholderPage
      icon={<Network className="w-8 h-8" />}
      title="Fraud Network Intelligence"
      description="Interactive graph visualization of complex fraud networks. Map relationships between persons, phones, UPIs, devices, bank accounts, and locations. Analyze money flows, call patterns, and device sharing with comprehensive timeline and risk analysis."
    />
  );
}
