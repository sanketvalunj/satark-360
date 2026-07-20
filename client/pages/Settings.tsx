import { Settings as SettingsIcon } from "lucide-react";
import PlaceholderPage from "./PlaceholderPage";

export default function Settings() {
  return (
    <PlaceholderPage
      icon={<SettingsIcon className="w-8 h-8" />}
      title="Settings"
      description="Configure platform settings, user roles, notification preferences, and integration settings. Manage API keys, database connections, and advanced configuration options for the enterprise platform."
    />
  );
}
