import apiClient from "./client";

import type {
    Institution,
} from "../types/institution";


export interface InstitutionCreate {
    name: string;
    institution_type: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
}


export interface InstitutionUpdate {
    name?: string;
    institution_type?: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    is_active?: boolean;
}


export const getInstitutions =
    async (): Promise<Institution[]> => {

        const response =
            await apiClient.get<Institution[]>(
                "/institutions"
            );

        return response.data;
    };


export const getInstitution =
    async (
        institutionId: number
    ): Promise<Institution> => {

        const response =
            await apiClient.get<Institution>(
                `/institutions/${institutionId}`
            );

        return response.data;
    };


export const createInstitution =
    async (
        data: InstitutionCreate
    ): Promise<Institution> => {

        const response =
            await apiClient.post<Institution>(
                "/institutions",
                data
            );

        return response.data;
    };


export const updateInstitution =
    async (
        institutionId: number,
        data: InstitutionUpdate
    ): Promise<Institution> => {

        const response =
            await apiClient.put<Institution>(
                `/institutions/${institutionId}`,
                data
            );

        return response.data;
    };


export const deactivateInstitution =
    async (
        institutionId: number
    ): Promise<Institution> => {

        const response =
            await apiClient.delete<Institution>(
                `/institutions/${institutionId}`
            );

        return response.data;
    };
