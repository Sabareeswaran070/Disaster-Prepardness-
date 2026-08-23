import apiClient from "./client";

import type {
    Announcement,
} from "../types/announcement";


export const getAnnouncements =
    async (
        disasterId?: number
    ): Promise<Announcement[]> => {

        const response =
            await apiClient.get<Announcement[]>(
                "/announcements",
                {
                    params: {
                        disaster_id:
                            disasterId,
                    },
                }
            );

        return response.data;
    };


export const getAnnouncement =
    async (
        announcementId: number
    ): Promise<Announcement> => {

        const response =
            await apiClient.get<Announcement>(
                `/announcements/${announcementId}`
            );

        return response.data;
    };
