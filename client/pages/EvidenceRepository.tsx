import { Archive } from "lucide-react";
import PlaceholderPage from "./PlaceholderPage";

export default function EvidenceRepository() {
  return (
    <PlaceholderPage
      icon={<Archive className="w-8 h-8" />}
      title="Evidence Repository"
      description="Secure storage and management of all evidence types. Handle images, videos, audio recordings, OCR documents, transcripts, and comprehensive metadata with full evidence chain tracking and timeline visualization."
    />
  );
}
