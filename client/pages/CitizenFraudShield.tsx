import { Shield } from "lucide-react";
import PlaceholderPage from "./PlaceholderPage";

export default function CitizenFraudShield() {
  return (
    <PlaceholderPage
      icon={<Shield className="w-8 h-8" />}
      title="Citizen Fraud Shield"
      description="AI-powered fraud detection assistant working like ChatGPT. Report suspicious activities, upload evidence, and receive real-time fraud analysis with adaptive questioning and missing evidence recommendations."
    />
  );
}
