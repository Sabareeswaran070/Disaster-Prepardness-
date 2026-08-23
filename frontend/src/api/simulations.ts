import apiClient from "./client";

import type {
    Simulation,
    SimulationDetail,
    SimulationResult,
    SubmitSimulationRequest,
} from "../types/simulation";


export const getSimulations =
    async (): Promise<Simulation[]> => {

        const response =
            await apiClient.get<Simulation[]>(
                "/simulations"
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