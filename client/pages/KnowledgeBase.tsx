import { useState } from "react";
import { Search, BookOpen } from "lucide-react";
import { SatarkLayout } from "@/components/SatarkLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";

export default function KnowledgeBase() {
  const { getKnowledgeEntries } = useApp();
  const [query, setQuery] = useState("");
  const entries = getKnowledgeEntries(query);

  return (
    <SatarkLayout>
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Knowledge Base
          </h1>
          <p className="text-muted-foreground mt-2">
            Search local scam intelligence and reference material.
          </p>
        </div>

        <Card className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search advisories, scam patterns, RBI checks..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-white text-foreground placeholder-muted-foreground outline-none focus:border-primary"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="p-6 card-hover">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{entry.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{entry.category}</p>
                </div>
                <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
              </div>
              <p className="text-sm text-foreground leading-relaxed">{entry.content}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </SatarkLayout>
  );
}
