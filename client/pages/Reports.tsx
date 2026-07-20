import { FileText } from "lucide-react";
import PlaceholderPage from "./PlaceholderPage";

export default function Reports() {
  return (
    <PlaceholderPage
      icon={<FileText className="w-8 h-8" />}
      title="Reports"
      description="Generate comprehensive investigation reports for citizen, officer, and court submission. Create fraud summaries, geographic reports, network graphs, and PDF exports with complete audit trails and evidence chains."
    />
  );
}
