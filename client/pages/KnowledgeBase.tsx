import { BookOpen } from "lucide-react";
import PlaceholderPage from "./PlaceholderPage";

export default function KnowledgeBase() {
  return (
    <PlaceholderPage
      icon={<BookOpen className="w-8 h-8" />}
      title="Knowledge Base"
      description="Centralized government intelligence repository. Access CERT-In advisories, MHA guidelines, RBI counterfeit specifications, cyber laws, scam scripts, and historical cases with semantic and vector search capabilities."
    />
  );
}
