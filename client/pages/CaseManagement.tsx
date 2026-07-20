import { FolderOpen } from "lucide-react";
import PlaceholderPage from "./PlaceholderPage";

export default function CaseManagement() {
  return (
    <PlaceholderPage
      icon={<FolderOpen className="w-8 h-8" />}
      title="Case Management"
      description="Centralized case repository for all investigations. Track open and closed cases, manage evidence, assign officers, monitor investigation timelines, and track court status with integrated risk assessment."
    />
  );
}
