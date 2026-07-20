import { platformEngine } from "@/engine";

export const NotificationService = {
    getNotifications() {
        return platformEngine.getState().notifications;
    },
};
