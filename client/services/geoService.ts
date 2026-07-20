import { platformEngine } from "@/engine";

export const GeoService = {
    getLocations() {
        return platformEngine.getState().locations;
    },
};
