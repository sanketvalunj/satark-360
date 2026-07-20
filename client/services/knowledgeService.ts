import { platformEngine } from "@/engine";

export const KnowledgeService = {
    search(query: string) {
        return platformEngine.searchKnowledgeBase(query);
    },
};
