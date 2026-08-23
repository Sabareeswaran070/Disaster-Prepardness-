import apiClient from "./client";

import type {
    Disaster,
} from "../types/disaster";


export const getDisasters =
    async (): Promise<Disaster[]> => {

        const response =
            await apiClient.get<Disaster[]>(
                "/disasters"
            );

        return response.data;
    };


export const getDisaster =
    async (
        disasterId: number
    ): Promise<Disaster> => {

        const response =
            await apiClient.get<Disaster>(
                `/disasters/${disasterId}`
            );

        return response.data;
    };
