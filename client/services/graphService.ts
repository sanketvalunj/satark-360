import { platformEngine } from "@/engine";

export const GraphService = {
    getGraph() {
        const state = platformEngine.getState();
        return {
            nodes: state.graphNodes,
            edges: state.graphEdges,
        };
    },
};
