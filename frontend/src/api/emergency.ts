import apiClient from "./client";

import type {
    Emergency,
    EmergencyCreate,
    EmergencyUpdate,
} from "../types/emergency";


// Student / public emergencies
export const getEmergencies = async (
    disasterId?: number
): Promise<Emergency[]> => {

    const response = await apiClient.get<Emergency[]>(
        "/emergencies",
        {
            params: {
                disaster_id: disasterId,
            },
        }
    );

    return response.data;
};


// Admin emergencies
export const getAdminEmergencies = async (
    disasterId?: number
): Promise<Emergency[]> => {

    const response = await apiClient.get<Emergency[]>(
        "/emergencies/manage",
        {
            params: {
                disaster_id: disasterId,
            },
        }
    );

    return response.data;
};


// Create emergency
export const createEmergency = async (
    data: EmergencyCreate
): Promise<Emergency> => {

    const response = await apiClient.post<Emergency>(
        "/emergencies",
        data
    );

    return response.data;
};


// Update emergency
export const updateEmergency = async (
    emergencyId: number,
    data: EmergencyUpdate
): Promise<Emergency> => {

    const response = await apiClient.put<Emergency>(
        `/emergencies/${emergencyId}`,
        data
    );

    return response.data;
};


// Delete emergency
export const deleteEmergency = async (
    emergencyId: number
): Promise<void> => {

    await apiClient.delete(
        `/emergencies/${emergencyId}`
    );
};