import apiClient from "./client";

import type {
    Announcement,
    AnnouncementCreate,
    AnnouncementUpdate,
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
                        disaster_id: disasterId,
                    },
                }
            );

        return response.data;
    };


export const getAdminAnnouncements =
    async (
        disasterId?: number
    ): Promise<Announcement[]> => {

        const response =
            await apiClient.get<Announcement[]>(
                "/announcements/manage",
                {
                    params: {
                        disaster_id: disasterId,
                    },
                }
            );

        return response.data;
    };


export const createAnnouncement =
    async (
        data: AnnouncementCreate
    ): Promise<Announcement> => {

        const response =
            await apiClient.post<Announcement>(
                "/announcements",
                data
            );

        return response.data;
    };


export const updateAnnouncement =
    async (
        announcementId: number,
        data: AnnouncementUpdate
    ): Promise<Announcement> => {

        const response =
            await apiClient.put<Announcement>(
                `/announcements/${announcementId}`,
                data
            );

        return response.data;
    };


export const publishAnnouncement =
    async (
        announcementId: number
    ): Promise<Announcement> => {

        const response =
            await apiClient.patch<Announcement>(
                `/announcements/${announcementId}/publish`
            );

        return response.data;
    };


export const unpublishAnnouncement =
    async (
        announcementId: number
    ): Promise<Announcement> => {

        const response =
            await apiClient.patch<Announcement>(
                `/announcements/${announcementId}/unpublish`
            );

        return response.data;
    };


export const deleteAnnouncement =
    async (
        announcementId: number
    ): Promise<void> => {

        await apiClient.delete(
            `/announcements/${announcementId}`
        );
    };
