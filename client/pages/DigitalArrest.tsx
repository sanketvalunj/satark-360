import { Phone } from "lucide-react";
import PlaceholderPage from "./PlaceholderPage";

export default function DigitalArrest() {
  return (
    <PlaceholderPage
      icon={<Phone className="w-8 h-8" />}
      title="Digital Arrest Detection"
      description="Real-time AI monitoring dashboard for detecting digital arrest scams. Live audio transcription, speech analysis, vision analysis, behavior analysis, and caller intelligence with comprehensive risk scoring."
    />
  );
}
