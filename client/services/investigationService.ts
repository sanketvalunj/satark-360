import { platformEngine } from "@/engine";
import type {
    CounterfeitInput,
    CreateComplaintInput,
    DigitalArrestInput,
} from "@/engine/platformEngine";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const InvestigationService = {
    async createComplaint(input: CreateComplaintInput) {
        await delay(150);
        return platformEngine.createComplaint(input);
    },

    async analyzeDigitalArrest(input: DigitalArrestInput) {
        await delay(150);
        return platformEngine.analyzeDigitalArrest(input);
    },

    async analyzeCounterfeit(input: CounterfeitInput) {
        await delay(150);
        return platformEngine.analyzeCounterfeit(input);
    },

    async generateReport(investigationId: string) {
        await delay(100);
        return platformEngine.generateReport(investigationId);
    },

    resolveInvestigation(investigationId: string) {
        return platformEngine.resolveInvestigation(investigationId);
    },
};
