import { Map } from "lucide-react";
import PlaceholderPage from "./PlaceholderPage";

export default function CrimeGeospatial() {
  return (
    <PlaceholderPage
      icon={<Map className="w-8 h-8" />}
      title="Geospatial Crime Intelligence"
      description="Interactive GIS mapping of crime incidents and hotspots. Visualize complaint locations, crime heatmaps, counterfeit seizures, and predictive crime zones with district-level statistics and patrol recommendations."
    />
  );
}
