import { SatarkLayout } from "@/components/SatarkLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function PlaceholderPage({
  title,
  description,
  icon,
}: PlaceholderPageProps) {
  return (
    <SatarkLayout>
      <div className="p-6 md:p-8">
        <Card className="p-12 text-center gradient-primary">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white text-3xl">
              {icon}
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Using This Module
            </Button>
            <Button size="lg" variant="outline">
              Learn More
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg border border-border">
              <div className="text-3xl font-bold text-primary mb-2">
                Coming Soon
              </div>
              <p className="text-muted-foreground">
                Full module implementation with comprehensive features
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg border border-border">
              <div className="text-3xl font-bold text-secondary mb-2">
                Pending
              </div>
              <p className="text-muted-foreground">
                Custom configuration and setup for your organization
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg border border-border">
              <div className="text-3xl font-bold text-primary mb-2">
                Ready
              </div>
              <p className="text-muted-foreground">
                Core infrastructure and database connections active
              </p>
            </div>
          </div>
        </Card>
      </div>
    </SatarkLayout>
  );
}
