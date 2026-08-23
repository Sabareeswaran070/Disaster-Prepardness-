import apiClient from "./client";

import type {
    Emergency,
} from "../types/emergency";


export const getEmergencies =
    async (
        disasterId?: number
    ): Promise<Emergency[]> => {

        const response =
            await apiClient.get<Emergency[]>(
                "/emergencies",
                {
                    params: {
                        disaster_id: disasterId,
                    },
                }
            );

        return response.data;
    };


export const getEmergency =
    async (
        emergencyId: number
    ): Promise<Emergency> => {

        const response =
            await apiClient.get<Emergency>(
                `/emergencies/${emergencyId}`
            );

        return response.data;
    };
