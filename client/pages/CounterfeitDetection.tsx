import { Banknote } from "lucide-react";
import PlaceholderPage from "./PlaceholderPage";

export default function CounterfeitDetection() {
  return (
    <PlaceholderPage
      icon={<Banknote className="w-8 h-8" />}
      title="Counterfeit Currency Detection"
      description="Advanced image analysis for currency authentication. Denomination detection, security thread analysis, watermark verification, microprint verification, texture analysis and RBI template matching with explainable AI."
    />
  );
}
