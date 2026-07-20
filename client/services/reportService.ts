import { platformEngine } from "@/engine";

export const ReportService = {
    async generateReport(investigationId: string) {
        return platformEngine.generateReport(investigationId);
    },
};
