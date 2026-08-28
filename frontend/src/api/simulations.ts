import apiClient from "./client";

import type {
    Simulation,
    SimulationDetail,
    SimulationResult,
    SubmitSimulationRequest,
    SimulationCreate,
    SimulationUpdate,
} from "../types/simulation";


// =========================
// Student
// =========================

export const getSimulations =
    async (
        disasterId?: number
    ): Promise<Simulation[]> => {

        const response =
            await apiClient.get<Simulation[]>(
                "/simulations",
                {
                    params: {
                        disaster_id: disasterId,
                    },
                }
            );

        return response.data;
    };


export const getSimulation =
    async (
        simulationId: number
    ): Promise<SimulationDetail> => {

        const response =
            await apiClient.get<SimulationDetail>(
                `/simulations/${simulationId}`
            );

        return response.data;
    };


// =========================
// Admin
// =========================

export const getAdminSimulations =
    async (
        disasterId?: number
    ): Promise<Simulation[]> => {

        const response =
            await apiClient.get<Simulation[]>(
                "/simulations/manage",
                {
                    params: {
                        disaster_id: disasterId,
                    },
                }
            );

        return response.data;
    };


export const getAdminSimulation =
    async (
        simulationId: number
    ): Promise<SimulationDetail> => {

        const response =
            await apiClient.get<SimulationDetail>(
                `/simulations/${simulationId}/admin`
            );

        return response.data;
    };


export const createSimulation =
    async (
        data: SimulationCreate
    ): Promise<Simulation> => {

        const response =
            await apiClient.post<Simulation>(
                "/simulations",
                data
            );

        return response.data;
    };


export const updateSimulation =
    async (
        simulationId: number,
        data: SimulationUpdate
    ): Promise<Simulation> => {

        const response =
            await apiClient.put<Simulation>(
                `/simulations/${simulationId}`,
                data
            );

        return response.data;
    };


export const addScenario =
    async (
        simulationId: number,
        data: {
            scenario_order: number;
            situation: string;
            choices: string;
            correct_choice: string;
            explanation?: string | null;
            points?: number;
        }
    ) => {

        const response =
            await apiClient.post(
                `/simulations/${simulationId}/scenarios`,
                data
            );

        return response.data;
    };


export const publishSimulation =
    async (
        simulationId: number
    ): Promise<Simulation> => {

        const response =
            await apiClient.patch<Simulation>(
                `/simulations/${simulationId}/publish`
            );

        return response.data;
    };


export const unpublishSimulation =
    async (
        simulationId: number
    ): Promise<Simulation> => {

        const response =
            await apiClient.patch<Simulation>(
                `/simulations/${simulationId}/unpublish`
            );

        return response.data;
    };


export const deleteSimulation =
    async (
        simulationId: number
    ): Promise<void> => {

        await apiClient.delete(
            `/simulations/${simulationId}`
        );
    };


// =========================
// Student Submit
// =========================

export const submitSimulation =
    async (
        simulationId: number,
        data: SubmitSimulationRequest
    ): Promise<SimulationResult> => {

        const response =
            await apiClient.post<SimulationResult>(
                `/simulations/${simulationId}/submit`,
                data
            );

        return response.data;
    };