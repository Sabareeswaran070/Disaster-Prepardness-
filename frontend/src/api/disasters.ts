import apiClient from "./client";

import type {
    Disaster,
} from "../types/disaster";


export interface DisasterCreate {
    name: string;
    description?: string | null;
    preparedness_guidelines?: string | null;
    response_guidelines?: string | null;
    recovery_guidelines?: string | null;
}


export interface DisasterUpdate {
    name?: string;
    description?: string | null;
    preparedness_guidelines?: string | null;
    response_guidelines?: string | null;
    recovery_guidelines?: string | null;
    is_active?: boolean;
}


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


export const createDisaster =
    async (
        data: DisasterCreate
    ): Promise<Disaster> => {

        const response =
            await apiClient.post<Disaster>(
                "/disasters",
                data
            );

        return response.data;
    };


export const updateDisaster =
    async (
        disasterId: number,
        data: DisasterUpdate
    ): Promise<Disaster> => {

        const response =
            await apiClient.put<Disaster>(
                `/disasters/${disasterId}`,
                data
            );

        return response.data;
    };
